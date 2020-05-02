const express = require("express");
const router = express.Router();
const Course = require("../../models/Course");
const { isLoggedIn, isAdminUser } = require("../../authentication/auth");
const jwt_decode = require("jwt-decode");
const csvjson = require('csvjson');
const readFile = require('fs').readFile;

router.post("/readFromCsv", isLoggedIn, isAdminUser, async (req, res) => {
    const universityName = await getUniversityOfUser(req.body.jwt);

    readFile('./Book2.csv', 'utf-8', (err, fileContent) => {
        if(err) {
            throw new Error(err);
        }
        const jsonObj = csvjson.toObject(fileContent);
        const courses = jsonObj.map( courseObj => {
            return new Course({
                courseName: courseObj.courseName.toLowerCase(),
                degreeName: courseObj.degreeName.toLowerCase(),
                universityName,
            });        
        })

        Course.insertMany(courses);
        return res.json(courses);
    });
});



router.post("/addCourse", isLoggedIn, isAdminUser, async (req, res) => {
    const jwt = req.body.jwt;
    const universityName = await getUniversityOfUser(jwt);
    const degreeName = req.body.degreeName.toLowerCase();
    const courseName = req.body.courseName.toLowerCase();

    Course.findOne( {universityName, degreeName, courseName} ).then( course => {
        if(course) {
            return res.status(400).json("course already exist");
        } 

        const newCourse = new Course({
            courseName,
            degreeName,
            universityName,
        });
    
        newCourse
            .save()
            .then(course => res.json(course))
            .catch(err => console.log(err));
    })
});

router.post("/deleteCourse", isLoggedIn, isAdminUser, (req, res) => {
    const jwt = req.body.jwt;
    const courseId = req.body.courseId;

    getUniversityOfUser(jwt).then( userUniversity => {
        Course.findOne( { _id: courseId }).then( course => {
            if(!course) {
                return res.status(400).json("couldn't find course");
            }

            if(userUniversity !== course.universityName) {
                return res.status(401).json(`you can only change courses of ${userUniversity}`);
            }

            Course.deleteOne( course ).then (course => {
                return res.status(200).json("course deleted");
            })
            .catch(err => res.status(400).json(err));
        })
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
});

router.post("/courses", isLoggedIn, isAdminUser, async (req, res) => {
    
    const { id } = jwt_decode(req.body.jwt);

    Profile.findOne({ user_id: id} ).then( profile => {
        const universityName = profile.university_name;
        
        Course.find({universityName}).then (coursesArray => {
            
            const coursesObjects = coursesArray.map ( course => {
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

function getUniversityOfUser(jwt) {
    const { id } = jwt_decode(jwt);

    let res = User.findOne({ _id:id }).then( user => {
        return user.universityName;
    })
    return res;
}

module.exports = router;
