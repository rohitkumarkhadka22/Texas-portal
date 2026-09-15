const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    answerText: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["submitted", "late", "graded"],
      default: "submitted",
    },

    marks: {
      type: Number,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

submissionSchema.index(
  {
    assignment: 1,
    student: 1,
    attemptNumber: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Submission", submissionSchema);
