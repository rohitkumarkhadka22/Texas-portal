const Fee = require("../models/Fee");
const Student = require("../models/Student");

const createFee = async (req, res) => {
  try {
    const {
      student,
      feeType,
      title,
      amount,
      paidAmount,
      dueDate,
      semester,
      description,
      isActive,
    } = req.body;

    if (
      !student ||
      !feeType ||
      !title ||
      amount === undefined ||
      !dueDate ||
      !semester
    ) {
      return res.status(400).json({
        message:
          "Student, fee type, title, amount, due date and semester are required",
      });
    }

    // Check student
    const studentData = await Student.findById(student);

    if (!studentData) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const totalAmount = Number(amount);
    const paid = Number(paidAmount || 0);

    if (totalAmount < 0 || paid < 0) {
      return res.status(400).json({
        message: "Amount cannot be negative",
      });
    }

    if (paid > totalAmount) {
      return res.status(400).json({
        message: "Paid amount cannot be greater than total amount",
      });
    }

    let status = "unpaid";

    if (paid === totalAmount && totalAmount > 0) {
      status = "paid";
    } else if (paid > 0 && paid < totalAmount) {
      status = "partial";
    }

    const fee = await Fee.create({
      student,
      feeType,
      title,
      amount: totalAmount,
      paidAmount: paid,
      dueDate,
      semester,
      status,
      description: description || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedFee = await Fee.findById(fee._id).populate(
      "student",
      "studentId course semester section",
    );

    res.status(201).json({
      message: "Fee created successfully",
      fee: populatedFee,
    });
  } catch (error) {
    console.error("Create fee error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate("student", "studentId course semester section")
      .sort({
        dueDate: 1,
      });

    res.status(200).json({
      count: fees.length,
      fees,
    });
  } catch (error) {
    console.error("Get all fees error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const fees = await Fee.find({
      student: student._id,
      isActive: true,
    }).sort({
      dueDate: 1,
    });

    const feesWithRemaining = fees.map((fee) => ({
      ...fee.toObject(),
      remainingAmount: fee.amount - fee.paidAmount,
    }));

    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);

    const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);

    const totalRemaining = totalAmount - totalPaid;

    res.status(200).json({
      summary: {
        totalAmount,
        totalPaid,
        totalRemaining,
      },
      count: fees.length,
      fees: feesWithRemaining,
    });
  } catch (error) {
    console.error("Get my fees error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findById(id).populate(
      "student",
      "studentId course semester section",
    );

    if (!fee) {
      return res.status(404).json({
        message: "Fee not found",
      });
    }

    res.status(200).json({
      fee: {
        ...fee.toObject(),
        remainingAmount: fee.amount - fee.paidAmount,
      },
    });
  } catch (error) {
    console.error("Get fee by ID error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findById(id);

    if (!fee) {
      return res.status(404).json({
        message: "Fee not found",
      });
    }

    const {
      feeType,
      title,
      amount,
      paidAmount,
      dueDate,
      semester,
      description,
      isActive,
    } = req.body;

    const newAmount = amount !== undefined ? Number(amount) : fee.amount;

    const newPaidAmount =
      paidAmount !== undefined ? Number(paidAmount) : fee.paidAmount;

    if (newAmount < 0 || newPaidAmount < 0) {
      return res.status(400).json({
        message: "Amount cannot be negative",
      });
    }

    if (newPaidAmount > newAmount) {
      return res.status(400).json({
        message: "Paid amount cannot be greater than total amount",
      });
    }

    fee.feeType = feeType ?? fee.feeType;
    fee.title = title ?? fee.title;
    fee.amount = newAmount;
    fee.paidAmount = newPaidAmount;
    fee.dueDate = dueDate ?? fee.dueDate;
    fee.semester = semester ?? fee.semester;
    fee.description = description ?? fee.description;
    fee.isActive = isActive ?? fee.isActive;

    if (newPaidAmount === newAmount && newAmount > 0) {
      fee.status = "paid";
    } else if (newPaidAmount > 0 && newPaidAmount < newAmount) {
      fee.status = "partial";
    } else {
      fee.status = "unpaid";
    }

    await fee.save();

    const updatedFee = await Fee.findById(id).populate(
      "student",
      "studentId course semester section",
    );

    res.status(200).json({
      message: "Fee updated successfully",
      fee: {
        ...updatedFee.toObject(),
        remainingAmount: updatedFee.amount - updatedFee.paidAmount,
      },
    });
  } catch (error) {
    console.error("Update fee error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findById(id);

    if (!fee) {
      return res.status(404).json({
        message: "Fee not found",
      });
    }

    await Fee.findByIdAndDelete(id);

    res.status(200).json({
      message: "Fee deleted successfully",
    });
  } catch (error) {
    console.error("Delete fee error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createFee,
  getAllFees,
  getMyFees,
  getFeeById,
  updateFee,
  deleteFee,
};
