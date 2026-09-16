const ExamSchedule = require("../models/ExamSchedule");
const Subject = require("../models/Subject");

const createExamSchedule = async (req, res) => {
  try {
    const {
      subject,
      course,
      semester,
      section,
      examType,
      examDate,
      startTime,
      endTime,
      room,
      duration,
      instructions,
      isPublished,
    } = req.body;

    if (
      !subject ||
      !course ||
      !semester ||
      !examType ||
      !examDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message:
          "Subject, course, semester, exam type, exam date, start time and end time are required",
      });
    }

    // Check subject
    const subjectData = await Subject.findById(subject);

    if (!subjectData) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Check course and semester
    if (
      subjectData.course !== course ||
      subjectData.semester !== Number(semester)
    ) {
      return res.status(400).json({
        message: "Subject course or semester does not match exam schedule",
      });
    }

    const examSchedule = await ExamSchedule.create({
      subject,
      course,
      semester,
      section: section || "",
      examType,
      examDate,
      startTime,
      endTime,
      room: room || "",
      duration: duration || 0,
      instructions: instructions || "",
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    const populatedExam = await ExamSchedule.findById(
      examSchedule._id,
    ).populate("subject", "name code course semester");

    res.status(201).json({
      message: "Exam schedule created successfully",
      examSchedule: populatedExam,
    });
  } catch (error) {
    console.error("Create exam schedule error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllExamSchedules = async (req, res) => {
  try {
    const schedules = await ExamSchedule.find()
      .populate("subject", "name code course semester")
      .sort({
        examDate: 1,
        startTime: 1,
      });

    res.status(200).json({
      count: schedules.length,
      examSchedules: schedules,
    });
  } catch (error) {
    console.error("Get all exam schedules error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getStudentExamSchedules = async (req, res) => {
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

    const schedules = await ExamSchedule.find({
      course: student.course,
      semester: student.semester,
      section: student.section,
      isPublished: true,
    })
      .populate("subject", "name code course semester")
      .sort({
        examDate: 1,
        startTime: 1,
      });

    res.status(200).json({
      count: schedules.length,
      examSchedules: schedules,
    });
  } catch (error) {
    console.error("Get student exam schedules error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getExamScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await ExamSchedule.findById(id).populate(
      "subject",
      "name code course semester",
    );

    if (!schedule) {
      return res.status(404).json({
        message: "Exam schedule not found",
      });
    }

    res.status(200).json({
      examSchedule: schedule,
    });
  } catch (error) {
    console.error("Get exam schedule by ID error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await ExamSchedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        message: "Exam schedule not found",
      });
    }

    const {
      subject,
      course,
      semester,
      section,
      examType,
      examDate,
      startTime,
      endTime,
      room,
      duration,
      instructions,
      isPublished,
    } = req.body;

    schedule.subject = subject ?? schedule.subject;
    schedule.course = course ?? schedule.course;
    schedule.semester = semester ?? schedule.semester;
    schedule.section = section ?? schedule.section;
    schedule.examType = examType ?? schedule.examType;
    schedule.examDate = examDate ?? schedule.examDate;
    schedule.startTime = startTime ?? schedule.startTime;
    schedule.endTime = endTime ?? schedule.endTime;
    schedule.room = room ?? schedule.room;
    schedule.duration = duration ?? schedule.duration;
    schedule.instructions = instructions ?? schedule.instructions;
    schedule.isPublished = isPublished ?? schedule.isPublished;

    await schedule.save();

    const updatedSchedule = await ExamSchedule.findById(id).populate(
      "subject",
      "name code course semester",
    );

    res.status(200).json({
      message: "Exam schedule updated successfully",
      examSchedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Update exam schedule error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await ExamSchedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        message: "Exam schedule not found",
      });
    }

    await ExamSchedule.findByIdAndDelete(id);

    res.status(200).json({
      message: "Exam schedule deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam schedule error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createExamSchedule,
  getAllExamSchedules,
  getStudentExamSchedules,
  getExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
};
