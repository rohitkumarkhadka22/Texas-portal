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

module.exports = {
  createStudentProfile,
  getMyProfile,
  updateMyProfile,
};
