const express = require("express");

const {
  submitAssignment,
  getSubmissionsForTeacher,
  gradeSubmission,
  getMySubmissions,
} = require("../controllers/submissionController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("student"),
  upload.single("file"),
  submitAssignment,
);

router.get(
  "/teacher",
  protect,
  authorizeRoles("teacher"),
  getSubmissionsForTeacher,
);

router.get(
  "/my-submissions",
  protect,
  authorizeRoles("student"),
  getMySubmissions,
);

router.put(
  "/:id/grade",
  protect,
  authorizeRoles("teacher"),
  gradeSubmission
);

module.exports = router;
