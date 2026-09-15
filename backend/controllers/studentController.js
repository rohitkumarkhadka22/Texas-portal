const Student = require("../models/Student");
const User = require("../models/User");

const createStudentProfile = async (req, res) => {
  try {
    const {
      studentId,
      course,
      semester,
      section,
      dateOfBirth,
      gender,
      address,
      admissionDate,
      guardian,
    } = req.body;

    if (!studentId || !course || !semester) {
      return res.status(400).json({
        message: "StudentId, course and semester are required",
      });
    }

    const existingProfile = await Student.findOne({
      user: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Student profile already exists ",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        message: "only student can create a student profile",
      });
    }

    const student = await Student.create({
      user: req.user.id,
      studentId,
      course,
      semester,
      section,
      dateOfBirth,
      gender,
      address,
      admissionDate,
      guardian,
    });

    res.status(201).json({
      message: "Student profile created sucessfully",
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user.id,
    }).populate("user", "name email phone profileImage role");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }
    res.status(200).json({
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "course",
      "semester",
      "section",
      "dateOfBirth",
      "gender",
      "address",
      "guardian",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).populate("user", "name email phone profileImage role");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      message: "Student profile updated successfully",
      student,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "name email phone profileImage role isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: students.length,
      students,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const createStudentByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      studentId,
      course,
      semester,
      section,
      dateOfBirth,
      gender,
      address,
      admissionDate,
      guardian,
    } = req.body;

    if (!name || !email || !password || !studentId || !course || !semester) {
      return res.status(400).json({
        message:
          "Name, email, password, studentId, course and semester are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const existingStudent = await Student.findOne({ studentId });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student ID already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      role: "student",
      isActive: true,
    });

    const student = await Student.create({
      user: user._id,
      studentId,
      course,
      semester,
      section: section || "",
      dateOfBirth,
      gender: gender || "other",
      address: address || "",
      admissionDate,
      guardian: guardian || {},
    });

    res.status(201).json({
      message: "Student created successfully",
      student: {
        ...student.toObject(),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createStudentProfile,
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  createStudentByAdmin,
};
