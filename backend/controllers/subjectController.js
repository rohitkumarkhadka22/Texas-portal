const Subject = require("../models/Subject");
const Student = require("../models/Student");
const User = require("../models/User");

// Create Subject
const createSubject = async (req, res) => {
  try {
    const { name, code, course, semester, creditHours, description, teacher } =
      req.body;

    if (!name || !code || !course || !semester || !creditHours) {
      return res.status(400).json({
        message: "Name, code, course, semester and credit hours are required",
      });
    }

    const existingSubject = await Subject.findOne({
      code: code.toUpperCase(),
    });

    if (existingSubject) {
      return res.status(400).json({
        message: "Subject with this code already exists",
      });
    }

    const subject = await Subject.create({
      name,
      code,
      course,
      semester,
      creditHours,
      description: description || "",
      teacher: teacher || null,
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get All Subjects
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

// Get Subjects By Semester
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

// Get My Subjects
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

// Assign Teacher To Subject
const assignTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        message: "Teacher ID is required",
      });
    }

    // Check subject
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Check teacher user
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

    // Assign teacher
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
