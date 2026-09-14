const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  course: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  creditHours: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Subject", subjectSchema);