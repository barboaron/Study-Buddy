const express = require("express");
const router = express.Router();
// const Course = require("../../models/Course");
const Forum = require("../../models/Forum");
const { isLoggedIn } = require("../../authentication/auth");
const jwt_decode = require("jwt-decode");

// get forums
// create post
// add comment to post
// delete post
// delete comment

router.post("/", isLoggedIn, (req, res) => {
    const { id } = jwt_decode(req.body.jwt);
  
    Profile.findOne({ user_id: id })
      .then((profile) => {
        const courses = profile.courses;
        Forum.find({})
          .then((forums) => {
            let filteredForums = forums.filter((forum) => {
              return courses
                .map((course) => course.id.toString())
                .includes(forum.courseId.toString());
            });

            res.status(200).json({ forums: filteredForums });
          })
          .catch((err) => res.status(400).json(err));
      })
      .catch((err) => res.status(400).json(err));
});

module.exports = router;
