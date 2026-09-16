const Result = require("../models/Result");
const Student = require("../models/Student");
const Subject = require("../models/Subject");

const createResult = async (req, res) => {
  try {
    const { student, subject, examType, marksObtained, totalMarks, remarks } =
      req.body;

    if (
      !student ||
      !subject ||
      !examType ||
      marksObtained === undefined ||
      totalMarks === undefined
    ) {
      return res.status(400).json({
        message:
          "Student, subject, exam type, marks obtained and total marks are required",
      });
    }

    const allowedExamTypes = ["pre-board", "final"];

    if (!allowedExamTypes.includes(examType)) {
      return res.status(400).json({
        message: "Exam type must be either pre-board or final",
      });
    }

    const obtained = Number(marksObtained);
    const total = Number(totalMarks);

    if (!Number.isFinite(obtained) || !Number.isFinite(total)) {
      return res.status(400).json({
        message: "Marks must be valid numbers",
      });
    }

    if (total <= 0) {
      return res.status(400).json({
        message: "Total marks must be greater than 0",
      });
    }

    if (obtained < 0) {
      return res.status(400).json({
        message: "Marks obtained cannot be negative",
      });
    }

    if (obtained > total) {
      return res.status(400).json({
        message: `Marks obtained cannot be greater than total marks (${total})`,
      });
    }

    const studentExists = await Student.findById(student);

    if (!studentExists) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const subjectExists = await Subject.findById(subject);

    if (!subjectExists) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    if (!subjectExists.teacher) {
      return res.status(400).json({
        message: "No teacher is assigned to this subject",
      });
    }

    if (subjectExists.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to create result for this subject",
      });
    }

    // =========================
    // 8. Student course/semester
    // =========================
    if (
      studentExists.course !== subjectExists.course ||
      studentExists.semester !== subjectExists.semester
    ) {
      return res.status(403).json({
        message: "This student does not belong to this subject",
      });
    }

    // =========================
    // 9. Duplicate result
    // =========================
    const existingResult = await Result.findOne({
      student,
      subject,
      examType,
    });

    if (existingResult) {
      return res.status(409).json({
        message:
          "Result already exists for this student, subject and exam type",
      });
    }

    const percentage = (obtained / total) * 100;

    let grade;

    if (percentage >= 90) {
      grade = "A+";
    } else if (percentage >= 80) {
      grade = "A";
    } else if (percentage >= 70) {
      grade = "B+";
    } else if (percentage >= 60) {
      grade = "B";
    } else if (percentage >= 50) {
      grade = "C+";
    } else if (percentage >= 40) {
      grade = "C";
    } else {
      grade = "F";
    }

    const result = await Result.create({
      student,
      subject,
      teacher: req.user.id,
      examType,
      marksObtained: obtained,
      totalMarks: total,
      grade,
      remarks: remarks || "",
    });

    const populatedResult = await Result.findById(result._id)
      .populate("student", "studentId course semester section")
      .populate("subject", "name code course semester creditHours")
      .populate("teacher", "name email");

    res.status(201).json({
      message: "Result created successfully",
      result: populatedResult,
    });
  } catch (error) {
    console.error("Create result error:", error);

    // Duplicate key error from MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Result already exists for this student, subject and exam type",
      });
    }

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid student or subject ID",
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid result data",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const results = await Result.find({
      student: student._id,
    })
      .populate("subject", "name code course semester creditHours")
      .populate("teacher", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Get my results error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTeacherResults = async (req, res) => {
  try {
    const results = await Result.find({
      teacher: req.user.id,
    })
      .populate("student", "studentId course semester section")
      .populate("subject", "name code course semester")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Get teacher results error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id)
      .populate("student", "studentId course semester section")
      .populate("subject", "name code course semester creditHours")
      .populate("teacher", "name email");

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    // Student can only view own result
    if (req.user.role === "student") {
      const student = await Student.findOne({
        user: req.user.id,
      });

      if (
        !student ||
        result.student._id.toString() !== student._id.toString()
      ) {
        return res.status(403).json({
          message: "You are not allowed to view this result",
        });
      }
    }

    // Teacher can only view own created result
    if (req.user.role === "teacher") {
      if (result.teacher._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          message: "You are not allowed to view this result",
        });
      }
    }

    res.status(200).json({
      result,
    });
  } catch (error) {
    console.error("Get result by ID error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createResult,
  getMyResults,
  getTeacherResults,
  getResultById,
};
