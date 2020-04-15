const Validator = require("validator");
const isEmpty = require("is-empty");

let universityEmailDomains =  {
  'Ben Gurion University' :'bgu.ac.il',
  'MTA':'mta.ac.il',
  'Tel Aviv University': 'tau.ac.il',
  'HIT': 'hit.ac.il',
};

module.exports = function validateRegisterInput(data) {
  let errors = {};

// Convert empty fields to an empty string so we can use validator functions
  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.universityName = !isEmpty(data.universityName) ? data.universityName : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
// Name checks
  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "First name field is required";
  }
  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last name field is required";
  }
//University Name checks
    if (Validator.isEmpty(data.universityName)) {
        errors.universityName = "University name field is required";
    }
// Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  } else if (!isValidEmailDomain(data.email, data.universityName)) {
    errors.email = "Please register with your university email";
  }
// Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required";
  }
if (!Validator.isLength(data.password, { min: 8, max: 30 })) {
    errors.password = "Password must be at least 8 characters";
  }
if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
return {
    errors,
    isValid: isEmpty(errors)
  };
};

function isValidEmailDomain(email, universityName) {
  return email.toLowerCase().includes(universityEmailDomains[universityName])
}