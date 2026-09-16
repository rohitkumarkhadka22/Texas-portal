const Teacher = require("../models/Teacher");
const User = require("../models/User");

const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      teacherId,
      department,
      designation,
      qualification,
      specialization,
      joiningDate,
      address,
      bio,
    } = req.body;

    if (!name || !email || !password || !teacherId || !department) {
      return res.status(400).json({
        message:
          "Name, email, password, teacher ID and department are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }
    const existingTeacher = await Teacher.findOne({ teacherId });
    if (existingTeacher) {
      return res.status(400).json({
        message: "Teacher with this ID already exists",
      });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: "teacher",
      phone: phone || "",
    });

    const teacher = await Teacher.create({
      user: user._id,
      teacherId,
      department,
      designation: designation || "Lecturer",
      qualification: qualification || "",
      specialization: specialization || "",
      joiningDate: joiningDate || undefined,
      address: address || "",
      bio: bio || "",
    });

    res.status(201).json({
      message: "Teacher created successfully",
      teacher: {
        id: teacher._id,
        teacherId: teacher.teacherId,
        department: teacher.department,
        designation: teacher.designation,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
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

const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", department = "" } = req.query;

    const pageNumber = Math.max(parseInt(page), 1);
    const limitNumber = Math.max(parseInt(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // Teacher search/filter
    const teacherQuery = {};

    // Department filter
    if (department) {
      teacherQuery.department = {
        $regex: department,
        $options: "i",
      };
    }

    // Search by teacher ID
    if (search) {
      teacherQuery.teacherId = {
        $regex: search,
        $options: "i",
      };
    }

    const totalTeachers = await Teacher.countDocuments(teacherQuery);

    const teachers = await Teacher.find(teacherQuery)
      .populate("user", "name email phone profileImage role isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalTeachers / limitNumber);

    res.status(200).json({
      count: teachers.length,
      totalTeachers,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      teachers,
    });
  } catch (error) {
    console.error("Get all teachers error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      user: req.user.id,
    }).populate("user", "name email phone profileImage role");

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    res.status(200).json({
      teacher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createTeacher,
  getAllTeachers,
  getMyTeacherProfile,
};
