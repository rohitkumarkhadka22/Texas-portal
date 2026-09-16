const Timetable = require("../models/Timetable");
const Subject = require("../models/Subject");
const User = require("../models/User");

const createTimetable = async (req, res) => {
  try {
    const {
      day,
      subject,
      teacher,
      course,
      semester,
      section,
      startTime,
      endTime,
      room,
      isActive,
    } = req.body;

    if (
      !day ||
      !subject ||
      !teacher ||
      !course ||
      !semester ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message:
          "Day, subject, teacher, course, semester, start time and end time are required",
      });
    }

    // Check subject
    const subjectData = await Subject.findById(subject);

    if (!subjectData) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Check teacher
    const teacherData = await User.findById(teacher);

    if (!teacherData || teacherData.role !== "teacher") {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    // Check subject course and semester
    if (
      subjectData.course !== course ||
      subjectData.semester !== Number(semester)
    ) {
      return res.status(400).json({
        message: "Subject course or semester does not match timetable",
      });
    }

    // Check teacher assigned to subject
    if (
      subjectData.teacher &&
      subjectData.teacher.toString() !== teacher.toString()
    ) {
      return res.status(400).json({
        message: "This teacher is not assigned to this subject",
      });
    }

    const timetable = await Timetable.create({
      day,
      subject,
      teacher,
      course,
      semester,
      section: section || "",
      startTime,
      endTime,
      room: room || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate("subject", "name code course semester")
      .populate("teacher", "name email role");

    res.status(201).json({
      message: "Timetable created successfully",
      timetable: populatedTimetable,
    });
  } catch (error) {
    console.error("Create timetable error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate("subject", "name code course semester")
      .populate("teacher", "name email role")
      .sort({
        day: 1,
        startTime: 1,
      });

    res.status(200).json({
      count: timetables.length,
      timetables,
    });
  } catch (error) {
    console.error("Get all timetables error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getStudentTimetable = async (req, res) => {
  try {
    const Student = require("../models/Student");

    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const timetables = await Timetable.find({
      course: student.course,
      semester: student.semester,
      section: student.section,
      isActive: true,
    })
      .populate("subject", "name code course semester")
      .populate("teacher", "name email")
      .sort({
        day: 1,
        startTime: 1,
      });

    res.status(200).json({
      count: timetables.length,
      timetables,
    });
  } catch (error) {
    console.error("Get student timetable error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTeacherTimetable = async (req, res) => {
  try {
    const timetables = await Timetable.find({
      teacher: req.user.id,
      isActive: true,
    })
      .populate("subject", "name code course semester")
      .populate("teacher", "name email")
      .sort({
        day: 1,
        startTime: 1,
      });

    res.status(200).json({
      count: timetables.length,
      timetables,
    });
  } catch (error) {
    console.error("Get teacher timetable error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findById(id)
      .populate("subject", "name code course semester")
      .populate("teacher", "name email role");

    if (!timetable) {
      return res.status(404).json({
        message: "Timetable not found",
      });
    }

    res.status(200).json({
      timetable,
    });
  } catch (error) {
    console.error("Get timetable by ID error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findById(id);

    if (!timetable) {
      return res.status(404).json({
        message: "Timetable not found",
      });
    }

    const {
      day,
      subject,
      teacher,
      course,
      semester,
      section,
      startTime,
      endTime,
      room,
      isActive,
    } = req.body;

    timetable.day = day ?? timetable.day;
    timetable.subject = subject ?? timetable.subject;
    timetable.teacher = teacher ?? timetable.teacher;
    timetable.course = course ?? timetable.course;
    timetable.semester = semester ?? timetable.semester;
    timetable.section = section ?? timetable.section;
    timetable.startTime = startTime ?? timetable.startTime;
    timetable.endTime = endTime ?? timetable.endTime;
    timetable.room = room ?? timetable.room;
    timetable.isActive = isActive ?? timetable.isActive;

    await timetable.save();

    const updatedTimetable = await Timetable.findById(id)
      .populate("subject", "name code course semester")
      .populate("teacher", "name email role");

    res.status(200).json({
      message: "Timetable updated successfully",
      timetable: updatedTimetable,
    });
  } catch (error) {
    console.error("Update timetable error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findById(id);

    if (!timetable) {
      return res.status(404).json({
        message: "Timetable not found",
      });
    }

    await Timetable.findByIdAndDelete(id);

    res.status(200).json({
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    console.error("Delete timetable error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createTimetable,
  getAllTimetables,
  getStudentTimetable,
  getTeacherTimetable,
  getTimetableById,
  updateTimetable,
  deleteTimetable,
};
