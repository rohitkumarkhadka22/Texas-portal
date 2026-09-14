const express = require("express");

const {
  createSubject,
  getAllSubjects,
  getSubjectBySemester,
  getMySubjects,
} = require("../controllers/subjectController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createSubject);

router.get(
  "/",
  protect,
  authorizeRoles("admin", "teacher", "student"),
  getAllSubjects,
);

router.get(
  "/semester",
  protect,
  authorizeRoles("admin", "teacher", "student"),
  getSubjectBySemester
);

router.get("/my-subjects", protect, authorizeRoles("student"), getMySubjects);

module.exports = router;
