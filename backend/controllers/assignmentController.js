const Assignment = require("../models/Assignment");
const Subject = require("../models/Subject");
const Student = require("../models/Student");

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      course,
      semester,
      dueDate,
      totalMarks,
      attachment,
      isPublished,
    } = req.body;

    if (
      !title ||
      !description ||
      !subject ||
      !course ||
      semester === undefined ||
      !dueDate ||
      totalMarks === undefined
    ) {
      return res.status(400).json({
        message:
          "Title, description, subject, course, semester, due date and total marks are required",
      });
    }

    const semesterNumber = Number(semester);

    if (
      !Number.isInteger(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        message: "Semester must be a whole number between 1 and 8",
      });
    }

    const totalMarksNumber = Number(totalMarks);

    if (!Number.isFinite(totalMarksNumber) || totalMarksNumber <= 0) {
      return res.status(400).json({
        message: "Total marks must be greater than 0",
      });
    }

    const dueDateValue = new Date(dueDate);

    if (Number.isNaN(dueDateValue.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    const subjectExists = await Subject.findById(subject);

    if (!subjectExists) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    if (
      subjectExists.teacher &&
      subjectExists.teacher.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "You are not assigned to this subject",
      });
    }

    if (
      subjectExists.course !== course ||
      subjectExists.semester !== semesterNumber
    ) {
      return res.status(400).json({
        message: "Assignment course or semester does not match the subject",
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      teacher: req.user.id,
      course,
      semester: semesterNumber,
      dueDate: dueDateValue,
      totalMarks: totalMarksNumber,
      attachment: attachment || "",
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("subject", "name code course semester")
      .populate("teacher", "name email");

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Assignment already exists",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid subject ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid assignment data",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      teacher: req.user.id,
    })
      .populate("subject", "name code course semester")
      .sort({ dueDate: 1 });

    res.status(200).json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get teacher assignments error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getStudentAssignments = async (req, res) => {
  try {
    console.log("Logged in user ID:", req.user.id);

    const student = await Student.findOne({
      user: req.user.id,
    });

    console.log("Found student:", student);

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const assignments = await Assignment.find({
      course: student.course,
      semester: student.semester,
      isPublished: true,
    })
      .populate("subject", "name code course semester")
      .populate("teacher", "name email")
      .sort({ dueDate: 1 });

    res.status(200).json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get student assignments error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// const getStudentAssignments = async (req, res) => {
//   try {
//     const student = await Student.findOne({
//       user: req.user.id,
//     }).populate("user", "name email");

//     if (!student) {
//       return res.status(404).json({
//         message: "Student profile not found",
//       });
//     }

//     const assignments = await Assignment.find({
//       course: student.course,
//       semester: student.semester,
//       isPublished: true,
//     })
//       .populate("subject", "name code course semester")
//       .populate("teacher", "name email")
//       .sort({ dueDate: 1 });

//     res.status(200).json({
//       count: assignments.length,
//       assignments,
//     });
//   } catch (error) {
//     console.error("Get student assignments error:", error);

//     res.status(500).json({
//       message: "Server error",
//     });
//   }
// };

const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate("subject", "name code course semester")
      .populate("teacher", "name email");

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      assignment,
    });
  } catch (error) {
    console.error("Get assignment by ID error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createAssignment,
  getMyAssignments,
  getStudentAssignments,
  getAssignmentById,
};
