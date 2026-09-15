const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Subject = require("../models/Subject");

const markAttendance = async (req, res) => {
  try {
    const { student, subject, date, status, remarks } = req.body;

    // Required fields
    if (!student || !subject || !date || !status) {
      return res.status(400).json({
        message: "Student, subject, date and status are required",
      });
    }

    // Find student
    const studentExists = await Student.findById(student);

    if (!studentExists) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Find subject
    const subjectExists = await Subject.findById(subject);

    if (!subjectExists) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Check teacher is assigned to this subject
    if (
      !subjectExists.teacher ||
      subjectExists.teacher.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "You are not assigned to this subject",
      });
    }

    // Check student belongs to same course and semester
    if (
      studentExists.course !== subjectExists.course ||
      studentExists.semester !== subjectExists.semester
    ) {
      return res.status(403).json({
        message: "This student is not enrolled in this subject",
      });
    }

    const attendanceDate = new Date(date);

    // Check valid date
    if (Number.isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    // Check duplicate attendance
    const existingAttendance = await Attendance.findOne({
      student,
      subject,
      date: attendanceDate,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance already marked for this student on this date",
      });
    }

    // Create attendance
    const attendance = await Attendance.create({
      student,
      subject,
      teacher: req.user.id,
      date: attendanceDate,
      status,
      remarks: remarks || "",
    });

    // Populate response
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("student", "studentId course semester section")
      .populate("subject", "name code course semester")
      .populate("teacher", "name email");

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const attendance = await Attendance.find({
      student: student._id,
    })
      .populate("subject", "name code course semester creditHours")
      .populate("teacher", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyAttendanceSummary = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const attendance = await Attendance.find({
      student: student._id,
    }).populate("subject", "name code");

    const summary = {};

    attendance.forEach((record) => {
      if (!record.subject) return;

      const subjectId = record.subject._id.toString();

      if (!summary[subjectId]) {
        summary[subjectId] = {
          subject: record.subject,
          totalClasses: 0,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          percentage: 0,
        };
      }

      summary[subjectId].totalClasses += 1;

      if (record.status === "present") {
        summary[subjectId].present += 1;
      }

      if (record.status === "absent") {
        summary[subjectId].absent += 1;
      }

      if (record.status === "late") {
        summary[subjectId].late += 1;
      }

      if (record.status === "leave") {
        summary[subjectId].leave += 1;
      }
    });

    Object.values(summary).forEach((item) => {
      if (item.totalClasses > 0) {
        item.percentage = Number(
          ((item.present / item.totalClasses) * 100).toFixed(2),
        );
      }
    });

    res.status(200).json({
      summary: Object.values(summary),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getMyAttendanceSummary,
};
