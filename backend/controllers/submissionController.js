const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answerText } = req.body;

    // Required field
    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
      });
    }

    // Find student profile
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Check assignment is published
    if (!assignment.isPublished) {
      return res.status(400).json({
        message: "This assignment is not published",
      });
    }

    // Check student course and semester
    if (
      assignment.course !== student.course ||
      assignment.semester !== student.semester
    ) {
      return res.status(403).json({
        message: "This assignment is not assigned to you",
      });
    }

    // Count previous attempts
    const previousSubmissions = await Submission.countDocuments({
      assignment: assignmentId,
      student: student._id,
    });

    // Maximum 3 attempts
    if (previousSubmissions >= 3) {
      return res.status(400).json({
        message: "Maximum 3 submission attempts allowed",
      });
    }

    const attemptNumber = previousSubmissions + 1;

    // PDF file URL
    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : "";

    // Check answer/file
    if (!answerText && !req.file) {
      return res.status(400).json({
        message: "Please provide answer text or upload a PDF",
      });
    }

    // Check late submission
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    const status = now > dueDate ? "late" : "submitted";

    // Create submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: student._id,
      attemptNumber,
      answerText: answerText || "",
      fileUrl,
      submittedAt: now,
      status,
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("assignment", "title description dueDate totalMarks")
      .populate("student", "studentId course semester section");

    res.status(201).json({
      message: `Assignment submitted successfully. Attempt ${attemptNumber}/3`,
      submission: populatedSubmission,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getSubmissionsForTeacher = async (req, res) => {
  try {
    const { assignmentId } = req.query;

    // Find assignments created by logged-in teacher
    const teacherAssignments = await Assignment.find({
      teacher: req.user.id,
    }).select("_id");

    const assignmentIds = teacherAssignments.map(
      (assignment) => assignment._id,
    );

    // If specific assignmentId is provided
    if (assignmentId) {
      const isTeacherAssignment = assignmentIds.some(
        (id) => id.toString() === assignmentId,
      );

      if (!isTeacherAssignment) {
        return res.status(403).json({
          message: "You are not allowed to view this assignment submissions",
        });
      }
    }

    const filter = {
      assignment: assignmentId ? assignmentId : { $in: assignmentIds },
    };

    const submissions = await Submission.find(filter)
      .populate("assignment", "title description dueDate totalMarks subject")
      .populate("student", "studentId course semester section")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get teacher submissions error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    // Find submission
    const submission = await Submission.findById(id).populate(
      "assignment",
      "title totalMarks teacher",
    );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // Check teacher owns this assignment
    if (submission.assignment.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to grade this submission",
      });
    }

    // Marks required
    if (marks === undefined || marks === null) {
      return res.status(400).json({
        message: "Marks are required",
      });
    }

    // Convert marks to number
    const numericMarks = Number(marks);

    if (Number.isNaN(numericMarks)) {
      return res.status(400).json({
        message: "Marks must be a valid number",
      });
    }

    // Marks validation
    if (numericMarks < 0 || numericMarks > submission.assignment.totalMarks) {
      return res.status(400).json({
        message: `Marks must be between 0 and ${submission.assignment.totalMarks}`,
      });
    }

    // Update directly
    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      {
        marks: numericMarks,
        feedback: feedback || "",
        status: "graded",
      },
      {
        new: true,
        runValidators: false,
      },
    )
      .populate("assignment", "title description dueDate totalMarks")
      .populate("student", "studentId course semester section");

    res.status(200).json({
      message: "Submission graded successfully",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Grade submission error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    // Find student profile
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    // Find student's submissions
    const submissions = await Submission.find({
      student: student._id,
    })
      .populate("assignment", "title description dueDate totalMarks subject")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get my submissions error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  submitAssignment,
  getSubmissionsForTeacher,
  gradeSubmission,
  getMySubmissions,
};
