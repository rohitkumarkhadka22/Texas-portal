const Subject = require("../models/Subject");

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
      message: "Subject created scccessfully",
      subject,
    });
  } catch (error) {
    console.error(error);
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
      const: subjects.length,
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
    const Student = require("../models/Student");
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(400).json({
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
        studentId: student,
        studentId,
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

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectBySemester,
  getMySubjects,
};
