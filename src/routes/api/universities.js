const express = require("express");
const router = express.Router();
const University = require("../../models/University");
const { isLoggedIn, isAdminUser } = require("../../authentication/auth");
const jwt_decode = require("jwt-decode");


router.get("/", isLoggedIn,  (req, res) => {
    
    University.find({}).then( (universitiesArray) => {
        const universitiesNames = universitiesArray.map((universityObj) => {
            return universityObj.universityName;
        })
        return res.status(200).json(universitiesNames);
    })
    .catch(err => res.status(400).json(err));
});

router.get("/degrees", isLoggedIn, (req, res) => {
    const universityName = req.body.universityName;

    University.findOne({ universityName }).then( (university) => {
        const universityDegrees = university.universityDegrees.map((degree) => {
            return degree.degreeName;
        })
        return res.status(200).json(universityDegrees);
    })
    .catch(err => res.status(400).json(err));
});

router.get("/courses", isLoggedIn, (req, res) => {
    const universityName = req.body.universityName;
    const degreeName = req.body.degreeName;

    University.findOne({ universityName }).then( (university) => {
        const degree = university.universityDegrees.find( (degree) => {
            return degree.degreeName === degreeName
        });

        return res.status(200).json(degree.courses);
    })
    .catch(err => res.status(400).json(err));
});

router.post("/addUniversity", isLoggedIn, isAdminUser, (req, res) => {
    const universityName = req.body.universityName;
    University.findOne({ universityName }).then(university => {
        if (university) {
          return res.status(400).json("University already exist.");
      } else {
          const newUniversity = new University({
              universityName,
              universityDegrees: [],
            });

            newUniversity
              .save()
              .then(university => res.json(university))
              .catch(err => console.log(err));
          };
    })
    .catch(err => res.status(400).json(err));
});

router.post("/addDegrees", isLoggedIn, isAdminUser, (req, res) => {
    const jwt = req.body.jwt;
    const universityName = req.body.universityName;
    const degrees = req.body.degrees;
    const userUniversity = getUniversityOfUser(jwt);

    if(userUniversity !== universityName) {
        res.status(401).json(`you can only add data to ${userUniversity}`);
    } 

    University.findOne({ universityName }).then(async (university) => {
        if (!university) {
          return res.status(400).json("University not exist.");
        } else {
            const newDegrees = degrees.map((degree) => {
                return {
                    degreeName: degree,
                    courses: [],
                }
            });

            const filterdUniversityDegrees =  university.universityDegrees.map((degree) => {
                return degree.degreeName;
            })
            
            const filteredDegrees = newDegrees.filter((degree) => {
                return !(filterdUniversityDegrees.includes(degree.degreeName));
            })

            await University.update({ universityName }, {
                universityDegrees: university.universityDegrees.concat(filteredDegrees)
            });
            return res.status(200).json(filteredDegrees);
        }
    })
    .catch(err => res.status(400).json(err));
});

router.post("/addCourses", isLoggedIn, isAdminUser, (req, res) => {
    const jwt = req.body.jwt;
    const userUniversity = getUniversityOfUser(jwt);
    const universityName = req.body.universityName;
    const degreeName = req.body.degreeName;
    
    if(userUniversity !== universityName) {
        res.status(401).json(`you can only add data to ${userUniversity}`);
    } 

    let courses = new Set(req.body.courses);
    courses = Array.from(courses);

    University.findOne({ universityName }).then(async (university) => {
        if (!university) {
          return res.status(400).json("University not exist.");
        } else {
            const degree = university.universityDegrees.find( (degree) => {
                return degree.degreeName === degreeName;
            });

            const filteredCourses = courses.filter((course) => {
                return !(degree.courses.includes(course));
            })

            var index = university.universityDegrees.indexOf(degree);
            degree.courses = degree.courses.concat(filteredCourses);

            if (index !== -1) {
                university.universityDegrees[index] = degree;
            }

            await University.update({ universityName }, {
                universityDegrees: university.universityDegrees
            });
            return res.status(200).json(filteredCourses);
        }
    })
    .catch(err => res.status(400).json(err));
});

router.post("/deleteCourse", isLoggedIn, isAdminUser, (req, res) => {
    const jwt = req.body.jwt;
    const universityName = req.body.universityName;
    const degreeName = req.body.degreeName;
    const courseName = req.body.course;

    getUniversityOfUser(jwt).then( userUniversity => {
        if(userUniversity !== universityName) {
            res.status(401).json(`you can only change data to ${userUniversity}`);
        } 
    })
    
    University.findOne({ universityName }).then(async (university) => {
        if (!university) {
          return res.status(400).json("University not exist.");
        } else {
            const degree = university.universityDegrees.find( (degree) => {
                return degree.degreeName === degreeName;
            });

            var index = university.universityDegrees.indexOf(degree);
            
            degree.courses = degree.courses.filter( course => {
                return course !== courseName;
            })

            if (index !== -1) {
                university.universityDegrees[index] = degree;
            }

            await University.update({ universityName }, {
                universityDegrees: university.universityDegrees
            });
            return res.status(200).json(courseName);
        }
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
