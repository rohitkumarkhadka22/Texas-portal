const express = require("express");

const {
  createFee,
  getAllFees,
  getMyFees,
  getFeeById,
  updateFee,
  deleteFee,
} = require("../controllers/feeController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin - Create Fee
router.post("/", protect, authorizeRoles("admin"), createFee);

// Admin - Get All Fees
router.get("/", protect, authorizeRoles("admin"), getAllFees);

// Student - Get Own Fees
router.get("/my-fees", protect, authorizeRoles("student"), getMyFees);

// Admin - Get Fee By ID
router.get("/:id", protect, authorizeRoles("admin"), getFeeById);

// Admin - Update Fee
router.put("/:id", protect, authorizeRoles("admin"), updateFee);

// Admin - Delete Fee
router.delete("/:id", protect, authorizeRoles("admin"), deleteFee);

module.exports = router;
