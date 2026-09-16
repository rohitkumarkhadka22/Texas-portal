const Subject = require("../models/Subject");
const Student = require("../models/Student");
const User = require("../models/User");

const createSubject = async (req, res) => {
  try {
    const { name, code, course, semester, creditHours, description } = req.body;

    if (
      !name ||
      !code ||
      !course ||
      semester === undefined ||
      creditHours === undefined
    ) {
      return res.status(400).json({
        message: "Name, code, course, semester and credit hours are required",
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

    const creditHoursNumber = Number(creditHours);

    if (!Number.isFinite(creditHoursNumber) || creditHoursNumber <= 0) {
      return res.status(400).json({
        message: "Credit hours must be greater than 0",
      });
    }

    const existingSubject = await Subject.findOne({
      code: code.toUpperCase(),
    });

    if (existingSubject) {
      return res.status(409).json({
        message: "Subject with this code already exists",
      });
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      course,
      semester: semesterNumber,
      creditHours: creditHoursNumber,
      description: description || "",
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("Create subject error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Subject with this code already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid subject data",
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid data format",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("teacher", "name email")
      .sort({ semester: 1, name: 1 });

    res.status(200).json({
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getSubjectBySemester = async (req, res) => {
  try {
    const { semester } = req.query;

    if (!semester) {
      return res.status(400).json({
        message: "Semester is required",
      });
    }

    const subjects = await Subject.find({
      semester: Number(semester),
      isActive: true,
    })
      .populate("teacher", "name email")
      .sort({ name: 1 });

    res.status(200).json({
      count: subjects.length,
      semester: Number(semester),
      subjects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMySubjects = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const subjects = await Subject.find({
      course: student.course,
      semester: student.semester,
      isActive: true,
    })
      .populate("teacher", "name email")
      .sort({ name: 1 });

    res.status(200).json({
      student: {
        studentId: student.studentId,
        course: student.course,
        semester: student.semester,
      },
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const assignTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        message: "Teacher ID is required",
      });
    }

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
      isActive: true,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    subject.teacher = teacher._id;

    await subject.save();

    const updatedSubject = await Subject.findById(subject._id).populate(
      "teacher",
      "name email role",
    );

    res.status(200).json({
      message: "Teacher assigned successfully",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error("Assign teacher error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectBySemester,
  getMySubjects,
  assignTeacher,
};
