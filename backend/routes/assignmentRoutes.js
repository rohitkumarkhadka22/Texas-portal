const express = require("express");

const {
  createAssignment,
  getMyAssignments,
  getStudentAssignments,
  getAssignmentById,
} = require("../controllers/assignmentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("teacher"),
  createAssignment
);

router.get(
  "/my-assignments",
  protect,
  authorizeRoles("teacher"),
  getMyAssignments
);

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  getStudentAssignments
);

router.get(
  "/:id",
  protect,
  authorizeRoles("student", "teacher", "admin"),
  getAssignmentById
);

module.exports = router;