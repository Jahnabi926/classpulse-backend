const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Class = require("../models/class");
const classRouter = express.Router();

classRouter.post("/class/create", userAuth, async (req, res) => {
  try {
    const { className, subject } = req.body;
    const teacherId = req.user._id;

    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Creating a class instance of the class model, create a new class
    const grade = new Class({
      teacherId,
      className,
      subject,
      joinCode,
    });

    // Saves the data to the database
    const savedGrade = await grade.save();
    res.json({ message: "Class added successfully", data: savedGrade });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = classRouter;
