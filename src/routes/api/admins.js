/*This route contains actions for admin user only such as add course, delete course, add courses from CSV  */

const express = require("express");
const router = express.Router();
const Course = require("../../models/Course");
const { isLoggedIn, isAdminUser } = require("../../authentication/auth");
const jwt_decode = require("jwt-decode");
const csvjson = require("csvjson");
const fs = require("fs");
const readFile = require("fs").readFile;
const multer = require("multer");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Profile = require("../../models/Profile");
const { storage } = require("./../../utils/multer-util");
const upload = multer({ storage: storage }).single("file");
const { getUniversityOfUser, getMappedCourses, deleteCourseFromProfiles, createForumAndSaveToDB, addCourse } = require('./../../utils/admins-util');
const csvTypes = ["text/csv", "application/vnd.ms-excel"];

router.post("/readFromCsv", isLoggedIn, isAdminUser, (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    const universityName = await getUniversityOfUser(req.headers["jwt"]);
    readFile(req.file.path, "utf-8", async (err, fileContent) => {
      if (err) {
        throw new Error(err);
      }
      if (!csvTypes.includes(req.file.mimetype)) {
        await unlinkAsync(req.file.path);
        return res.status(400).json("file format must be CSV");
      }
      const jsonObj = csvjson.toObject(fileContent);
      let promiseArr = jsonObj.map((courseObj) => {
        return addCourse(universityName, courseObj.degreeName, courseObj.courseName);
      });
      await unlinkAsync(req.file.path);
      Promise.all(promiseArr).then( resArr => {
        Course.find({ universityName }).then((coursesArray) => {
          const returnArray = getMappedCourses(coursesArray);
          return res.status(200).json(returnArray);
        });
      })
    });
  });
});

router.post("/addCourse", isLoggedIn, isAdminUser, async (req, res) => {
  const jwt = req.body.jwt;
  const universityName = await getUniversityOfUser(jwt);
  const degreeName = req.body.degreeName.toLowerCase();
  const courseName = req.body.courseName.toLowerCase();

  addCourse(universityName, degreeName, courseName).then((course) => {
    if (!course) {
      return res.status(400).json("course already exist");
    }

    createForumAndSaveToDB(courseName, universityName, course._id);

    Course.find({ universityName })
      .then((coursesArray) => {
        const returnArray = getMappedCourses(coursesArray);
        return res.status(200).json(returnArray);
      })
      .catch((err) => console.log(err));
  });
});

router.post("/deleteCourse", isLoggedIn, isAdminUser, (req, res) => {
  const jwt = req.body.jwt;
  const courseId = req.body.courseId;

  getUniversityOfUser(jwt)
    .then((userUniversity) => {
      Course.findOne({ _id: courseId })
        .then((course) => {
          if (!course) {
            return res.status(400).json("couldn't find course");
          }

          if (userUniversity !== course.universityName) {
            return res
              .status(401)
              .json(`you can only change courses of ${userUniversity}`);
          }

          Course.deleteOne(course)
            .then((deleteInfo) => {
              deleteCourseFromProfiles(course);
              Course.find({ universityName: userUniversity })
                .then((coursesArray) => {
                  const returnArray = getMappedCourses(coursesArray);
                  return res.status(200).json(returnArray);
                })
                .catch((err) => res.status(400).json(err));
            })
            .catch((err) => res.status(400).json(err));
        })
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/courses", isLoggedIn, isAdminUser, async (req, res) => {
  const { id } = jwt_decode(req.body.jwt);

  Profile.findOne({ user_id: id })
    .then((profile) => {
      const universityName = profile.university_name;

      Course.find({ universityName }).then((coursesArray) => {
        const coursesObjects = coursesArray.map((course) => {
          return {
            id: course._id,
            courseName: course.courseName,
            degreeName: course.degreeName,
          };
        });

        return res.status(200).json(coursesObjects);
      });
    })
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
