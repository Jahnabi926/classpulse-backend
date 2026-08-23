const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const validateEmail = (value) => {
  if (!validator.isEmail(value)) {
    throw new Error("Invalid email address" + value);
  }
};

// Creating/ defining a Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate: validateEmail,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },
  },
  { timestamps: true },
);

// Adding userSchema methods BEFORE creating the model
userSchema.methods.getJWT = async function () {
  // arrow functions won't work for "this" keyword
  const user = this; // "this" is refering to that user who signed up

  // Create a JWT Token for the logged in user
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

// Creating userSchema methods to compare password(passwordInputByUser)
// Validating password for user trying to log in

userSchema.methods.comparePassword = async function (passwordInputByUser) {
  const user = this; // "this" is refering to that user who logged in
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );
  return isPasswordValid;
};
const User = mongoose.model("User", userSchema); // creating a model

module.exports = User; // exporting a model
