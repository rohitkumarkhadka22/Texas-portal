const express = require("express");

const {
  createExamSchedule,
  getAllExamSchedules,
  getStudentExamSchedules,
  getExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
} = require("../controllers/examScheduleController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createExamSchedule);

router.get("/", protect, authorizeRoles("admin"), getAllExamSchedules);

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  getStudentExamSchedules,
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "student", "teacher"),
  getExamScheduleById,
);

router.put("/:id", protect, authorizeRoles("admin"), updateExamSchedule);

router.delete("/:id", protect, authorizeRoles("admin"), deleteExamSchedule);

module.exports = router;
