const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Course = require("../../models/Course");
const jwt_decode = require("jwt-decode");
const { isLoggedIn } = require("../../authentication/auth");
// var fs = require("fs");
// var multer = require("multer");

router.post("/editCourses", isLoggedIn, (req, res) => {
    const jwt = req.body.jwt;
    const { id } = jwt_decode(jwt);

    Profile.findOne({ user_id: id }).then( (profile) => {
        Course.find( {
            universityName: profile.university_name, 
            degreeName: profile.degree_name.toLowerCase(),
        } ).then(async (courses) => {
            let coursesArray = [];
            if (!(req.body.coursesIds === undefined || req.body.coursesIds.length === 0)) {
                const filteredCourses = courses.filter( course => {
                    console.log(course._id);
                    return req.body.coursesIds.includes(course._id.toString());
                });
                coursesArray = filteredCourses.map( course => {
                    return {
                        id: course._id,
                        name: course.courseName,
                    }
                });
            }
            await Profile.update({_id: profile.id}, { courses: coursesArray});
            return res.json(coursesArray);
        })
    })
});

//UPDATE PROFILE (in the body, must send user_id, and all fields to be updated)
router.post("/updateProfile", isLoggedIn,  (req, res) => {
    
    const jwt = req.body.jwt;
    const { id } = jwt_decode(jwt);

    User.findOne({ _id: id }).then(user => {
        Profile.findOne({ user_id: id }).then(async (profile) => {
            
            if (!profile) {
                const newProfile = new Profile({
                    user_id: id,
                    courses: [],
                    degree_name: req.body.degree_name,
                    year_of_study: req.body.year_of_study,
                    university_name: user.universityName,
                });
                newProfile
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err));
            }  else {
                const updatedProfile = {
                    user_id: id,
                    degree_name: req.body.degree_name,
                    year_of_study: req.body.year_of_study,
                    university_name: user.universityName,
                };
                await Profile.update({_id: profile.id}, updatedProfile);
                return res.status(200).json(updatedProfile);
            };
        })
    })
    .catch(err => res.status(400).json("user doesn't exist"));
});

router.post("/profile", isLoggedIn, (req, res) => {
    
    const jwt = req.body.jwt;
    const { id } = jwt_decode(jwt);
    const profileUserId = req.body.userId;

    Profile.findOne({ user_id: profileUserId }).then( (profile) => {
        if (!profile) {
            return res.status(400).json("Profile does not exist.");
        }  else {
            let convertedProfile = JSON.parse(JSON.stringify(profile));

            if(id === profile.user_id) {
                convertedProfile.canEdit = true;
            } else {
                convertedProfile.canEdit = false;
                delete convertedProfile.study_groups;
            }

            return res.status(200).json(convertedProfile);
        };
    })
    .catch(err => res.status(400).json(err));
});

router.post("/courses", isLoggedIn, (req, res) => {
    
    const jwt = req.body.jwt;
    const { id } = jwt_decode(jwt);
    
    Profile.findOne({ user_id: id }).then( (profile) => {
        if (!profile) {
            return res.status(400).json("Profile does not exist.");
        }  else {
            return res.status(200).json(profile.courses);
        };
    })
    .catch(err => res.status(400).json(err));
});

module.exports = router;