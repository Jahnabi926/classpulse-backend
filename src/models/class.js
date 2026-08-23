const mongoose = require("mongoose");

// creating a schema
const classSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinCode: {
      type: String,
      unique: true,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

// creating a model
const Class = mongoose.model("Class", classSchema);

// exporting a model
module.exports = Class;
