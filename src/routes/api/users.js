/* This route contains actions related to users such as registration,
 login, change password and email confirmation */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const keys = require("../../../config/keys");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const User = require("../../models/User");
const { isLoggedIn } = require("../../authentication/auth");
const Course = require("../../models/Course");
const { getAllUniversities, validateNewPassword, sendMail, createNewUserObj, createNewProfile } = require('./../../utils/users-util');

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = createNewUserObj(req.body);
      const newProfile = createNewProfile(req.body, newUser._id);

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
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res
        .status(401)
        .json({ emailnotfound: "Email or password are incorrect." });
    } else if (!user.confirmed) {
      return res.status(401).json({ emailnotfound: "Email not confirmed" });
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = {
          id: user.id,
          name: user.firstName + " " + user.lastName,
        };
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 60*60, 
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

router.post("/changePassword", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);
  const { currentPassword, newPassword, confirmPassword } = req.body;

  User.findOne({ _id: id }).then((user) => {
    bcrypt.compare(currentPassword, user.password).then((isMatch) => {
      if (isMatch) {
        const validatePasswordString = validateNewPassword(currentPassword, newPassword, confirmPassword);

        if (validatePasswordString === "success") {
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

router.get("/allUniversities", (req, res) => {
  Course.find({})
    .then((coursesArray) => {
      const universities = getAllUniversities(coursesArray);

      return res.status(200).json(universities);
    })
    .catch((err) => res.status(400).json(err));
});

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
