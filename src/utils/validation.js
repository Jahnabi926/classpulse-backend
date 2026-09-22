const validator = require("validator");

const ValidateSignUpData = (req) => {
  const { firstName, lastName, emailId, password, role } = req.body;
  const roles = ["teacher", "student"];

  if (!firstName || firstName.length < 4) {
    throw new Error("First name must be at least 4 characters");
  } else if (!lastName) {
    throw new Error("Last name is required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password !");
  } else if (!roles.includes(role)) {
    throw new Error("Please select your role !");
  }
};
module.exports = ValidateSignUpData;
