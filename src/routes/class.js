const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Class = require("../models/class");
const classRouter = express.Router();

classRouter.post("/class/create", userAuth, async (req, res) => {
  try {
    const { className, subject } = req.body;
    if (!className || !subject) {
      throw new Error("Please enter both a class name and a subject.");
    }
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

classRouter.get("/class/my-classes", userAuth, async (req, res) => {
  try {
    const { _id, role } = req.user;
    let classes;

    if (role == "teacher") {
      classes = await Class.find({ teacherId: _id });
    } else {
      classes = await Class.find({ students: _id });
    }
    res.json({ message: "Classes fetched", data: classes });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

classRouter.get("/class/:classId", userAuth, async (req, res) => {
  const { classId } = req.params;

  try {
    const grade = await Class.findById(classId)
      .populate("teacherId", "firstName lastName emailId role")
      .populate("students", "firstName lastName emailId role");
    if (!grade) {
      throw new Error("Class not found");
    }
    const isTeacher = grade.teacherId.equals(req.user._id);
    const isStudent = grade.students.some((id) => id.equals(req.user._id));

    if (!isTeacher && !isStudent) {
      throw new Error("You don't belong to the class");
    }
    res.json({ message: "Class details fetched successfully", data: grade });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = classRouter;
