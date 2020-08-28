const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Course = require("../../models/Course");
const jwt_decode = require("jwt-decode");
const { isLoggedIn } = require("../../authentication/auth");
var fs = require("fs");
var multer = require("multer");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const defaultImgSrc = '/defaultPicUser.png';
const { storage } = require("./../../utils/multer-util");
const  { filterDegrees, convertProfile, validateProfileDetails, filterAndFormatCourses } = require('./../../utils/profiles-util');
var upload = multer({ storage: storage }).single("file");

router.post("/editCourses", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);

  Profile.findOne({ user_id: id }).then((profile) => {
    Course.find({
      universityName: profile.university_name,
      degreeName: profile.degree_name.toLowerCase(),
    }).then(async (courses) => {
      let coursesArray = filterAndFormatCourses(req.body.coursesIds, courses);

      await Profile.update(
        { _id: profile.id },
        { courses: coursesArray, isFullDetails: true }
      );
      return res.json(coursesArray);
    })
    .catch(err => res.status(400).json(err));
  })
  .catch(err => res.status(400).json(err));
});

//UPDATE PROFILE (in the body, must send user_id, and all fields to be updated)
router.post("/updateProfile", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);

  User.findOne({ _id: id })
    .then((user) => {
      Profile.findOne({ user_id: id }).then(async (profile) => {
        if (!profile) {
          return res.status(400).json("Profile does not exist.");
        } else {
          const { errors, isValid } = await validateProfileDetails(
            req.body,
            profile.university_name
          );
          // Check validation
          if (!isValid) {
            return res.status(400).json(errors);
          }
          const updatedProfile = {
            degree_name: req.body.degree_name,
            year_of_study: req.body.year_of_study,
          };
          await Profile.update({ _id: profile.id }, updatedProfile);
          return res.status(200).json(updatedProfile);
        }
      });
    })
    .catch((err) => res.status(400).json("user doesn't exist"));
});

router.post("/profile", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);
  const profileUserId = req.body.userId;

  Profile.findOne({ user_id: profileUserId })
    .then((profile) => {
      if (!profile) {
        return res.status(400).json("Profile does not exist.");
      } else {
        let convertedProfile = convertProfile(profile, id);
        return res.status(200).json(convertedProfile);
      }
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/profileByJWT", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);

  Profile.findOne({ user_id: id })
    .then((profile) => {
      if (!profile) {
        return res.status(400).json("Profile does not exist.");
      } else {
        let convertedProfile = convertProfile(profile, id);
        return res.status(200).json(convertedProfile);
      }
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/changeProfilePic", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.headers["jwt"]);

  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
  });

  Profile.findOne({ user_id: id })
    .then(async (profile) => {
      if (!profile) {
        return res.status(400).json("Profile does not exist.");
      } else {
        if(profile.imgSrc !== defaultImgSrc)
        {
          await unlinkAsync(`./public/${profile.imgSrc}`);
        }
        const imgSrc = "uploads/" + (req.file.path).substr(15);
        await Profile.update({ user_id: id }, { imgSrc });
        return res.status(200).json(imgSrc);
      }
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/courses", isLoggedIn, (req, res) => {
  const id = req.body.userId;

  Profile.findOne({ user_id: id })
    .then((profile) => {
      if (!profile) {
        return res.status(400).json("Profile does not exist.");
      } else {
        return res.status(200).json(profile.courses);
      }
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/allDegrees", isLoggedIn, (req, res) => {
  const jwt = req.body.jwt;
  const { id } = jwt_decode(jwt);

  Profile.findOne({ user_id: id })
    .then((profile) => {
      const universityName = profile.university_name;

      Course.find({ universityName })
        .then((coursesArray) => {
          const degrees = filterDegrees(coursesArray);

          return res.status(200).json(degrees);
        })
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
