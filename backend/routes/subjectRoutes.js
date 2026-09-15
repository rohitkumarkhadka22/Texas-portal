const express = require("express");

const {
  createSubject,
  getAllSubjects,
  getSubjectBySemester,
  getMySubjects,
  assignTeacher,
} = require("../controllers/subjectController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Create subject - Admin only
router.post("/", protect, authorizeRoles("admin"), createSubject);

// Get all subjects
router.get(
  "/",
  protect,
  authorizeRoles("admin", "teacher", "student"),
  getAllSubjects,
);

// Get subjects by semester
router.get(
  "/semester",
  protect,
  authorizeRoles("admin", "teacher", "student"),
  getSubjectBySemester,
);

// Get student's own subjects
router.get("/my-subjects", protect, authorizeRoles("student"), getMySubjects);

// Assign teacher to subject - Admin only
router.put("/:id/teacher", protect, authorizeRoles("admin"), assignTeacher);

module.exports = router;
