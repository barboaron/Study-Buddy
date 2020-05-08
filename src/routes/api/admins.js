const express = require("express");
const router = express.Router();
const Course = require("../../models/Course");
const { isLoggedIn, isAdminUser } = require("../../authentication/auth");
const jwt_decode = require("jwt-decode");
const csvjson = require('csvjson');
const fs = require('fs');
const readFile = require('fs').readFile;
const multer= require('multer');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'public')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname )
  }
});

var upload = multer({ storage: storage }).single('file');

const csvTypes = ['text/csv', 'application/vnd.ms-excel'];

router.post("/readFromCsv", isLoggedIn, isAdminUser, (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        
        const universityName = await getUniversityOfUser(req.headers['jwt']);
        readFile( req.file.path , 'utf-8', async (err, fileContent) => {
            if(err) {
                throw new Error(err);
            } 
            if(!csvTypes.includes(req.file.mimetype)) {
                await unlinkAsync(req.file.path);
                return res.status(400).json("file format must be CSV");
            }
            const jsonObj = csvjson.toObject(fileContent);
            jsonObj.forEach( courseObj => {
                addCourse(universityName, courseObj.degreeName, courseObj.courseName);
            });
            await unlinkAsync(req.file.path);
            Course.find({ universityName }).then( coursesArray => {
                const returnArray = coursesArray.map( course => {
                    return {
                        id: course._id,
                        courseName: course.courseName,
                        degreeName: course.degreeName,
                        universityName: course.universityName,
                    }
                })
                return res.status(200).json(returnArray);
            });
        });
    });
});



router.post("/addCourse", isLoggedIn, isAdminUser, async (req, res) => {
    const jwt = req.body.jwt;
    const universityName = await getUniversityOfUser(jwt);
    const degreeName = req.body.degreeName.toLowerCase();
    const courseName = req.body.courseName.toLowerCase();

    addCourse(universityName, degreeName, courseName).then(course => {
        if(!course) {
            return res.status(400).json("course already exist");   
        }

        Course.find({ universityName }).then( coursesArray => {
            const returnArray = coursesArray.map( course => {
                return {
                    id: course._id,
                    courseName: course.courseName,
                    degreeName: course.degreeName,
                    universityName: course.universityName,
                }
            })
            return res.status(200).json(returnArray);
        }).catch(err => console.log(err));
    });
});

function addCourse(universityName, degreeName, courseName) {
    let res = Course.findOne( {universityName, degreeName, courseName} ).then( course => {
        if(course) {
            return Promise.resolve(null);
        } 

        const newCourse = new Course({
            courseName,
            degreeName,
            universityName,
        });
    
        return newCourse.save()
    });
    return res;
} 

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
                Course.find({ universityName: userUniversity}).then( coursesArray => {
                    const returnArray = coursesArray.map( course => {
                        return {
                            id: course._id,
                            courseName: course.courseName,
                            degreeName: course.degreeName,
                            universityName: course.universityName,
                        }
                    })
                    return res.status(200).json(returnArray);
                }).catch(err => res.status(400).json(err));
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
