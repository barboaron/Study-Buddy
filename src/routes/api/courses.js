const express = require("express");
const router = express.Router();
const Course = require("../../models/Course");
const Profile = require("../../models/Profile");
const { isLoggedIn } = require("../../authentication/auth");
const jwt_decode = require("jwt-decode");

router.post("/", isLoggedIn, (req, res) => {
    
    const { id } = jwt_decode(req.body.jwt);

    Profile.findOne({ user_id: id} ).then( profile => {
        const universityName = profile.university_name;
        const degreeName = profile.degree_name;
        
        Course.find({}).then (coursesArray => {
            const courses = coursesArray.filter( course => {
                return course.universityName === universityName 
                    && course.degreeName === degreeName;
            });
            
            const coursesObjects = courses.map ( course => {
                return {
                    id: course._id,
                    name: course.courseName,
                    degreeName: course.degreeName,
                }
            });

            return res.status(200).json(coursesObjects);
        })
    })
    .catch(err => res.status(400).json(err));
});


module.exports = router;
