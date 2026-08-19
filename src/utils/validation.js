const validator = require("validator");

const ValidateSignUpData = (req) => {
  const { firstName, lastName, emailId, password, role } = req.body;
  const roles = ["teacher", "student"];

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password !");
  } else if (!roles.includes(role)) {
    throw new Error("Please select your role !");
  }
};

module.exports = ValidateSignUpData;
