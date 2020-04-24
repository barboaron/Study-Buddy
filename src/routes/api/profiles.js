const express = require("express");
const router = express.Router();
// Load User model
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const jwt_decode = require("jwt-decode");
const { isLoggedIn } = require("../../authentication/auth");
var fs = require("fs");
var multer = require("multer");

// CREATE PROFILE (in the body, must send all fields required)
router.post("/createProfile", isLoggedIn, (req, res) => {
    const jwt = req.body.jwt;
    const { id } = jwt_decode(jwt);

    User.findOne({ _id: id }).then(user => {
          if (!user) {
            return res.status(400).json("User does not exist.");
        } else {
            
            const newProfile = new Profile({
                user_id: user.id,
                courses: req.body.courses,
                degree_name: req.body.degree_name,
                year_of_study: req.body.year_of_study,
                university_name: user.universityName,
          });

          newProfile.img.data = fs.readFileSync(req.files.userPhoto.path)
          newProfile.img.contentType = "image/png";

            newProfile
                .save()
                .then(profile => res.json(profile))
                .catch(err => console.log(err));
            };
          });
})

//UPDATE PROFILE (in the body, must send user_id, and all fields to be updated)
router.post("/updateProfile", isLoggedIn,  (req, res) => {
    
    const jwt = req.body.jwt;
    const { id:loggedInUserId } = jwt_decode(jwt);
    const profileUserId = req.body.id;

    Profile.findOne({ _id: profileUserId }).then(async (profile) => {
        
        if (!profile) {
            return res.status(400).json("Profile does not exist.");
        }  else {
            if(loggedInUserId === profile.user_id) {
                await Profile.update({_id: profile.id}, req.body.dataToUpdate);
                return res.status(200).json("Profile updated");
            } else {
                return res.status(401).json("cannot edit user profile");
            }
        };
    })
    .catch(err => res.status(400));
});

router.get("/profile", isLoggedIn, (req, res) => {
    
    const jwt = req.body.jwt;
    const { id:loggedInUserId } = jwt_decode(jwt);
    const profileUserId = req.body.id;

    Profile.findOne({ _id: profileUserId }).then( (profile) => {
        
        if (!profile) {
            return res.status(400).json("Profile does not exist.");
        }  else {
            var convertedProfile = JSON.parse(JSON.stringify(profile));

            if(loggedInUserId === profile.user_id) {
                convertedProfile.canEdit = true;
            } else {
                convertedProfile.canEdit = false;
                delete convertedProfile.study_groups;
            }

            return res.status(200).json(convertedProfile);
        };
    
    })
    .catch(err => res.status(400));
});

module.exports = router;