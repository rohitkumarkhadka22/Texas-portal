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

    if (!studentId || !course || semester === undefined) {
      return res.status(400).json({
        message: "StudentId, course and semester are required",
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

    const allowedGenders = ["male", "female", "other"];

    if (gender && !allowedGenders.includes(gender)) {
      return res.status(400).json({
        message: "Gender must be male, female or other",
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
        message: "Only student can create a student profile",
      });
    }

    const existingProfile = await Student.findOne({
      user: req.user.id,
    });

    if (existingProfile) {
      return res.status(409).json({
        message: "Student profile already exists",
      });
    }

    const existingStudentId = await Student.findOne({
      studentId,
    });

    if (existingStudentId) {
      return res.status(409).json({
        message: "Student ID already exists",
      });
    }

    // 8. Create student profile
    const student = await Student.create({
      user: req.user.id,
      studentId,
      course,
      semester: semesterNumber,
      section: section || "",
      dateOfBirth,
      gender: gender || "other",
      address: address || "",
      admissionDate,
      guardian: guardian || {},
    });

    res.status(201).json({
      message: "Student profile created successfully",
      student,
    });
  } catch (error) {
    console.error("Create student profile error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid student data",
        error: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Student ID or student profile already exists",
      });
    }

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
    const {
      page = 1,
      limit = 10,
      search = "",
      course = "",
      semester = "",
    } = req.query;

    const pageNumber = Math.max(parseInt(page), 1);
    const limitNumber = Math.max(parseInt(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // Search condition
    const query = {};

    // Course filter
    if (course) {
      query.course = {
        $regex: course,
        $options: "i",
      };
    }

    // Semester filter
    if (semester) {
      query.semester = Number(semester);
    }

    // Search by studentId
    if (search) {
      query.studentId = {
        $regex: search,
        $options: "i",
      };
    }

    const totalStudents = await Student.countDocuments(query);

    const students = await Student.find(query)
      .populate("user", "name email phone profileImage role isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalStudents / limitNumber);

    res.status(200).json({
      count: students.length,
      totalStudents,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      students,
    });
  } catch (error) {
    console.error("Get all students error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
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
