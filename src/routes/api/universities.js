const express = require("express");
const router = express.Router();
const University = require("../../models/University");

router.get("/",  (req, res) => {
    
    University.find({}).then( (universitiesArray) => {
        const universitiesNames = universitiesArray.map((universityObj) => {
            return universityObj.universityName;
        })
        return res.status(200).json(universitiesNames);
    })
    .catch(err => res.status(400).json(err));
});

router.get("/degrees",  (req, res) => {
    const universityName = req.body.universityName;

    University.findOne({ universityName }).then( (university) => {
        const universityDegrees = university.universityDegrees.map((degree) => {
            return degree.degreeName;
        })
        return res.status(200).json(universityDegrees);
    })
    .catch(err => res.status(400).json(err));
});

router.get("/courses",  (req, res) => {
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

router.post("/addUniversity",  (req, res) => {
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

router.post("/addDegrees",  (req, res) => {
    const universityName = req.body.universityName;
    const degrees = req.body.degrees;

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

router.post("/addCourses",  (req, res) => {
    const universityName = req.body.universityName;
    const degreeName = req.body.degreeName;
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



module.exports = router;
