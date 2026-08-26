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

classRouter.post("/class/join", userAuth, async (req, res) => {
  try {
    const { joinCode } = req.body;
    const { _id, firstName } = req.user;

    const grade = await Class.findOne({ joinCode: joinCode });
    if (!grade) {
      throw new Error("Enter the Correct Code !");
    }
    let studentsArray = grade.students;
    if (studentsArray.includes(_id)) {
      throw new Error(`${firstName} already joined`);
    }
    studentsArray.push(_id);
    const savedGrade = await grade.save();
    res.json({
      message: `${firstName} joined the class successfully`,
      data: savedGrade,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

classRouter.post("/class/leave", userAuth, async (req, res) => {
  try {
    const { classId } = req.body;
    const { _id, firstName } = req.user;
    const grade = await Class.findById(classId);
    if (!grade) {
      throw new Error("Class not found");
    }
    if (!grade.students.includes(_id)) {
      throw new Error(`${firstName} already left the class`);
    }
    grade.students = grade.students.filter((id) => !id.equals(_id));
    const savedGrade = await grade.save();
    res.json({
      message: `${firstName} left the class Successfully`,
      data: savedGrade,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = classRouter;
