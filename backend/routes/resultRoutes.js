const express = require("express");

const {
  createResult,
  getMyResults,
  getTeacherResults,
  getResultById,
} = require("../controllers/resultController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("teacher"), createResult);

router.get("/my-results", protect, authorizeRoles("student"), getMyResults);

router.get("/teacher", protect, authorizeRoles("teacher"), getTeacherResults);

router.get(
  "/:id",
  protect,
  authorizeRoles("student", "teacher", "admin"),
  getResultById,
);

module.exports = router;
