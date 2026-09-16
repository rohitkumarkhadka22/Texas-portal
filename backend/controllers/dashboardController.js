const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Assignment = require("../models/Assignment");
const Notice = require("../models/Notice");
const Fee = require("../models/Fee");

const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeaches,
      totalSubjects,
      totalAssignments,
      totalNotices,
      totalFees,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Subject.countDocuments(),
      Assignment.countDocuments(),
      Notice.countDocuments(),
      Fee.countDocuments(),
    ]);

    const feeSummary = await Fee.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
        },
      },
    ]);

    const totalFeeAmount =
      feeSummary.length > 0 ? feeSummary[0].totalAmount : 0;
    const totalPaidAmount = feeSummary.length > 0 ? feeSummary[0].totalPaid : 0;

    const totalPendingAmount = totalFeeAmount - totalPaidAmount;

    res.status(200).json({
      students: totalStudents,
      teachers: totalTeaches,
      subjects: totalSubjects,
      assignments: totalAssignments,
      notices: totalNotices,
      fee: totalFees,

      feeSummary: {
        totalAmount: totalFeeAmount,
        totalPaid: totalPaidAmount,
        totalPending: totalPendingAmount,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};
