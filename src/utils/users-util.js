const Profile = require("./../models/Profile");
const User = require("./../models/User");
const nodemailer = require("nodemailer");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const keys = require("./../../config/keys");
const Validator = require("validator");

function createNewProfile(data, user_id) {
    return new Profile({
      firstName: data.firstName,
      lastName: data.lastName,
      isFullDetails: false,
      university_name: data.universityName,
      user_id,
      courses: [],
      imgSrc: "/defaultPicUser.png",
    });
  }
  
  function createNewUserObj(data) {
    return new User({
      firstName: data.firstName,
      lastName: data.lastName,
      universityName: data.universityName,
      email: data.email.toLowerCase(),
      password: data.password,
      confirmed: false,
      isAdmin: false,
      seenNotifications: [],
      unseenNotifications: [],
    });
  }

  function sendMail(user) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "studybuddynoreply@gmail.com",
        pass: "studyBuddy2020",
      },
    });
    const payload = {
      id: user.id,
      name: user.firstName,
    };
    // Sign token
    jwt.sign(
      payload,
      keys.secretOrKey,
      {
        expiresIn: 86400, // 1 day in seconds
      },
      (err, token) => {
        var decoded = jwt_decode(token);
        const mailOptions = {
          from: "studybuddynoreply@gmail.com",
          to: user.email,
          subject: "Confirm your email - StudyBuddy",
          html: `Click the link to confirm your registration: http://localhost:5000/confirmation/${token}`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    );
  }

  function validateNewPassword(currentPassword, newPassword, confirmPassword) {
    if (Validator.isEmpty(newPassword)) {
      return "New Password field is required";
    }
    if (Validator.isEmpty(confirmPassword)) {
      return "Confirm Password field is required";
    }
    if (!Validator.isLength(newPassword, { min: 8, max: 30 })) {
      return "New password must be at least 8 characters";
    }
    if (!Validator.equals(newPassword, confirmPassword)) {
      return "Confirm password must match to new password";
    }
    if (Validator.equals(currentPassword, newPassword)) {
      return "New password can't be the same as old password";
    }
  
    return "success";
  }

  function getAllUniversities(courseObjects) {
    const universityNames = courseObjects.map((courseObject) => {
      return courseObject.universityName;
    });
    const universitiesSet = new Set(universityNames);
    return Array.from(universitiesSet);
  }

  module.exports = { getAllUniversities, validateNewPassword, sendMail, createNewUserObj, createNewProfile };