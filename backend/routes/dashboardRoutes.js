const express = require("express");

const { getDashboardSummary } = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/summary", protect, authorizeRoles("admin"), getDashboardSummary);

module.exports = router;
