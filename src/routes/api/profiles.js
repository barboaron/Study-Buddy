const express = require("express");
const router = express.Router();
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/User");
const Profile = require("../../models/Profile");

// CREATE PROFILE (in the body, must send all fields required)
router.post("/createProfile", (req, res) => {
    User.findOne({ _id: req.body.user_id }).then(user => {
          if (!user) {
            return res.status(400).json("User does not exist.");
        } else {
            const newProfile = new Profile({
                user_id: user.id,
                courses: req.body.courses,
                degree_name: req.body.degree_name,
                year_of_study: req.body.year_of_study
          });

            newProfile
                .save()
                .then(profile => res.json(profile))
                .catch(err => console.log(err));
            };
          });
})

//UPDATE PROFILE (in the body, must send user_id, and all fields to be updated)
router.post("/updateProfile",  (req, res) => {
    
    const user_id = req.body.user_id;

    Profile.findOne({ user_id }).then(async (profile) => {
        
        if (!profile) {
            return res.status(400).json("Profile does not exist.");
    }   else {
            await Profile.update({_id: profile.id}, req.body);
            return res.status(200).json("Profile updated");
        };
    
        })
        .catch(err => res.status(400));
});

module.exports = router;