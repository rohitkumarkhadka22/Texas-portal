const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");

// ==========================================
// SUBMIT ASSIGNMENT
// ==========================================
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answerText } = req.body;

    // 1. Required assignment ID
    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
      });
    }

    // 2. Find student profile
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    // 3. Find assignment
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // 4. Check published
    if (!assignment.isPublished) {
      return res.status(400).json({
        message: "This assignment is not published",
      });
    }

    // 5. Check course
    if (assignment.course !== student.course) {
      return res.status(403).json({
        message: "This assignment is not assigned to you",
      });
    }

    // 6. Check semester
    if (assignment.semester !== student.semester) {
      return res.status(403).json({
        message: "This assignment is not assigned to you",
      });
    }

    // 7. Check answer or PDF
    if (!answerText?.trim() && !req.file) {
      return res.status(400).json({
        message: "Please provide answer text or upload a PDF",
      });
    }

    // 8. Count previous submissions
    const previousSubmissions = await Submission.countDocuments({
      assignment: assignmentId,
      student: student._id,
    });

    // 9. Maximum 3 attempts
    if (previousSubmissions >= 3) {
      return res.status(400).json({
        message: "Maximum 3 submission attempts allowed",
      });
    }

    // 10. Attempt number
    const attemptNumber = previousSubmissions + 1;

    // 11. File URL
    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : "";

    // 12. Check late submission
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    const status = now > dueDate ? "late" : "submitted";

    // 13. Create submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: student._id,
      attemptNumber,
      answerText: answerText?.trim() || "",
      fileUrl,
      submittedAt: now,
      status,
    });

    // 14. Populate response
    const populatedSubmission = await Submission.findById(submission._id)
      .populate("assignment", "title description dueDate totalMarks")
      .populate("student", "studentId course semester section");

    res.status(201).json({
      message: `Assignment submitted successfully. Attempt ${attemptNumber}/3`,
      submission: populatedSubmission,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    // Duplicate attempt
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This submission attempt already exists",
      });
    }

    // Mongoose validation
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid submission data",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET SUBMISSIONS FOR TEACHER
// ==========================================
const getSubmissionsForTeacher = async (req, res) => {
  try {
    const { assignmentId } = req.query;

    const teacherAssignments = await Assignment.find({
      teacher: req.user.id,
    }).select("_id");

    const assignmentIds = teacherAssignments.map(
      (assignment) => assignment._id,
    );

    // Specific assignment
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

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GRADE SUBMISSION
// ==========================================
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    // 1. Find submission
    const submission = await Submission.findById(id).populate(
      "assignment",
      "title totalMarks teacher",
    );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // 2. Check teacher ownership
    if (submission.assignment.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to grade this submission",
      });
    }

    // 3. Marks required
    if (marks === undefined || marks === null) {
      return res.status(400).json({
        message: "Marks are required",
      });
    }

    // 4. Convert marks
    const numericMarks = Number(marks);

    if (!Number.isFinite(numericMarks)) {
      return res.status(400).json({
        message: "Marks must be a valid number",
      });
    }

    // 5. Validate marks
    if (numericMarks < 0 || numericMarks > submission.assignment.totalMarks) {
      return res.status(400).json({
        message: `Marks must be between 0 and ${submission.assignment.totalMarks}`,
      });
    }

    // 6. Update submission
    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      {
        marks: numericMarks,
        feedback: feedback?.trim() || "",
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

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid submission ID",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY SUBMISSIONS
// ==========================================
const getMySubmissions = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

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
