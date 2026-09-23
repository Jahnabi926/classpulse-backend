const express = require("express");
const ValidateSignUpData = require("../utils/validation");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validate Data in signup api
    ValidateSignUpData(req);
    const { firstName, lastName, emailId, password, role } = req.body;

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating user instance of the user model, Create a new user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      role,
    });

    // Saves the data to the database
    const savedUser = await user.save();

    // Send the token to the browser inside a secure cookie
    const token = await user.getJWT();
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }); // expires in 24 hours
    res.json({
      message: `${user.firstName} signedIn successfully`,
      data: savedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send("ERROR: Email already registered");
    }
    res.status(400).send("ERROR : " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (isPasswordValid) {
      // Once email and password is validated, Create a JWT Token
      const token = await user.getJWT();

      // Send the token to the browser inside a secure cookie
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.json({
        message: `${user.firstName} loggedIn Successfully !`,
        data: user,
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "Logged out successfully" });
});
module.exports = authRouter;
