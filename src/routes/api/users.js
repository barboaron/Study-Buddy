const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const keys = require("../../../config/keys");
const Validator = require("validator");
const isEmpty = require("is-empty");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const { isLoggedIn } = require("../../authentication/auth");
const Course = require("../../models/Course");

router.post("/register", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        universityName: req.body.universityName,
        email: req.body.email.toLowerCase(),
        password: req.body.password,
        confirmed: false,
        isAdmin: false,
        seenNotifications: [],
        unseenNotifications: [],
      });
      const newProfile = new Profile({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        isFullDetails: false,
        university_name: req.body.universityName,
        user_id: newUser._id,
        courses: [],
      });
      newProfile
        .save()
        .then((profile) => {})
        .catch((err) => console.log(err));
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          sendMail(newUser);
          setTimeout(() => {
            User.findOne({ email: newUser.email }).then((user) => {
              if (!user.confirmed) {
                User.deleteOne({ email: user.email })
                  .then((res) => {})
                  .catch((err) => {
                    console.log(err);
                  });
              }
            });
          }, 86400000);
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

router.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res
        .status(401)
        .json({ emailnotfound: "Email or password are incorrect." });
    } else if (!user.confirmed) {
      return res.status(401).json({ emailnotfound: "Email not confirmed" });
    }
    // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.firstName + " " + user.lastName,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 21600, //6 hours in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Email or password are incorrect." });
      }
    });
  });
});

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

router.post("/changePassword", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ _id: id }).then((user) => {
    bcrypt.compare(currentPassword, user.password).then((isMatch) => {
      if (isMatch) {
        const validatePasswordString = validateNewPassword(
          currentPassword,
          newPassword,
          confirmPassword
        );

        if (validatePasswordString === "success") {
          // Hash password before saving in database
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword, salt, async (err, hash) => {
              if (err) throw err;
              await User.update({ _id: id }, { password: hash });
              return res
                .status(200)
                .json({ success: "password successfully changed" });
            });
          });
        } else {
          return res
            .status(401)
            .json({ newPasswordinvalid: validatePasswordString });
        }
      } else {
        return res
          .status(401)
          .json({ currentPasswordIncorrect: "current password incorrect" });
      }
    });
  });
});

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

router.post("/getUserId", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);

  return res.status(200).json({ id });
});

router.post("/isLoggedIn", (req, res) => {
  if (!req.body.jwt) {
    res.status(401).json({ isLoggedIn: false });
  }

  const token = req.body.jwt.substring(7);

  jwt.verify(token, keys.secretOrKey, function (err, decoded) {
    if (err) {
      res.status(200).json({ isLoggedIn: false });
    } else {
      res.status(200).json({ isLoggedIn: true });
    }
  });
});

router.post("/isAdmin", (req, res) => {
  
  const { id } = jwt_decode(req.body.jwt);

  User.findOne( {_id:id} ).then( user => {
    return res.status(200).json( {isAdmin: user.isAdmin});
  }).catch(err => res.status(400).json(err));
});

// router.get("/usersAndIds", isLoggedIn,  (req, res) => {

//   User.find({}).then( (usersArray) => {
//       const universitiesNames = usersArray.map((userObj) => {
//           return userObj.;
//       })
//       return res.status(200).json(universitiesNames);
//   })
//   .catch(err => res.status(400).json(err));
// });

router.get("/allUniversities", (req, res) => {
  Course.find({})
    .then((coursesArray) => {
      const universities = getAllUniversities(coursesArray);

      return res.status(200).json(universities);
    })
    .catch((err) => res.status(400).json(err));
});

function getAllUniversities(courseObjects) {
  const universityNames = courseObjects.map((courseObject) => {
    return courseObject.universityName;
  });
  const universitiesSet = new Set(universityNames);
  return Array.from(universitiesSet);
}

router.post("/notifications", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);

  User.findOne( { _id: id }).then( user => {
    res.status(200).json({ 
      seenNotifications: user.seenNotifications,
      unseenNotifications: user.unseenNotifications,
     });
  }).catch(err => res.status(400).json('user not found'))
});

router.post("/updateSeenNotifications", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);

  User.findOne( { _id: id }).then( async user => {
    const seenNotifications = user.seenNotifications.concat(user.unseenNotifications);
    await User.updateOne( { _id: id }, { seenNotifications, unseenNotifications: [] });

    res.status(200).json({ seenNotifications, unseenNotifications: [] });
  }).catch(err => res.status(400).json('user not found'))
});

module.exports = router;
