/* This route contains actions related to forums such as get forums, create post, create comment etc */

const express = require("express");
const router = express.Router();
const Forum = require("../../models/Forum");
const Profile = require("../../models/Profile");
const { isLoggedIn } = require("../../authentication/auth");
const jwt_decode = require("jwt-decode");
const { validatePostInput, validateCommentInput, postTypes } = require("../../validation/post");
const multer = require("multer");
const { storage } = require("./../../utils/multer-util");
const  { filterForumsByUserCourses, createFilePaths, createPost, createNewComment, isImageFile, updateCommentsWithProfileImages, createCommentWithImg, addCommentToPost, deleteCommentFromPost, deletePostFromForum } = require('./../../utils/forums-util');

var upload = multer({ storage: storage });

router.post("/", isLoggedIn, (req, res) => {
    const { id } = jwt_decode(req.body.jwt);
  
    Profile.findOne({ user_id: id })
      .then((profile) => {
        const courses = profile.courses;
        Forum.find({})
          .then((forums) => {
            let filteredForums = filterForumsByUserCourses(courses, forums);
            let forumIds = filteredForums.map((forum) => {
              return { forumName: forum.forumName, forumId: forum._id, forumType: forum.forumType, forumCourse: forum.courseName };
            });

            res.status(200).json({ forums: forumIds });
          })
          .catch((err) => res.status(400).json(err));
      })
      .catch((err) => res.status(400).json(err));
});

router.post("/forum", isLoggedIn, (req, res) => {
  const forumId = req.body.forumId;

  Forum.findOne({ _id: forumId })
    .then((forum) => {
      res.status(200).json({ forum });
    })
  .catch((err) => res.status(400).json('forum not found'));
});

router.post("/postTypes", isLoggedIn, (req, res) => {
    res.status(200).json(postTypes);
});

router.post("/createPost", upload.array('file', 5), isLoggedIn, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const { forumId, title, content, type } = req.body;
  const { errors, isValid } = validatePostInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Forum.findOne({ _id: forumId })
    .then((forum) => {
      const filePaths = createFilePaths(req.files);
      const post = createPost(title, content, type, name, id, filePaths); 
      Forum.updateOne({ _id: forumId }, { posts: forum.posts.concat(post) }).then(
        () => {
          res.status(200).json(forum.posts.concat(post));
        }
      ).catch((err) => res.status(400).json('forum update failed'));
    })
  .catch((err) => res.status(400).json('forum not found'));
});

router.post("/addComment", upload.array('file', 5), isLoggedIn, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const { forumId, postId, comment } = req.body;
  
  const { errors, isValid } = validateCommentInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({ user_id: id})
    .then((profile) => {
      Forum.findOne({ _id: forumId })
      .then((forum) => {
        const filePaths = createFilePaths(req.files);
        const newComment = createNewComment(comment, name, id, profile._id.toString(), filePaths); 
        const posts = addCommentToPost(forum, postId, newComment);
        
        Forum.updateOne({ _id: forumId }, { posts }).then(
          () => {
            Forum.findOne({ _id: forumId })
              .then(async (forum) => {
                  const post = forum.posts.find((post) => post._id === postId);
                  const updatedComments = await updateCommentsWithProfileImages(post.comments);
                  res.status(200).json(updatedComments);
              }
            ).catch((err) => res.status(400).json('forum not found'));
          }
        ).catch((err) => res.status(400).json('forum update failed'));
      })
      .catch((err) => res.status(400).json('forum not found'));
    })
    .catch((err) => res.status(400).json('profile not found'));
});

router.post("/deleteComment", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const { forumId, postId, commentId } = req.body;

  Forum.findOne({ _id: forumId })
    .then((forum) => {
      deleteCommentFromPost(id, forum, postId, commentId).then( posts => {
        Forum.updateOne({ _id: forumId }, { posts }).then(
          async () => {
            const post = posts.find(currPost => currPost._id === postId);
            const updatedComments = await updateCommentsWithProfileImages(post.comments);
            res.status(200).json(updatedComments);
          }
        ).catch(() => res.status(400).json('forum update failed'));
      }).catch((err) => res.status(401).json(err));
    })
  .catch(() => res.status(400).json('forum not found'));
});

router.post("/deletePost", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const { forumId, postId } = req.body;

  Forum.findOne({ _id: forumId })
    .then((forum) => {
      
      deletePostFromForum(id, forum, postId).then( posts => {
        Forum.updateOne({ _id: forumId }, { posts }).then(
          (forum) => {
            res.status(200).json(postId);
          }
        ).catch(() => res.status(400).json('forum update failed'));
      }).catch((err) => res.status(401).json(err));
    })
  .catch(() => res.status(400).json('forum not found'));
});

router.post("/post", isLoggedIn, (req, res) => {
  const { forumId, postId } = req.body;

  Forum.findOne({ _id: forumId })
    .then((forum) => {
      const post = forum.posts.find((post) => post._id === postId);
      if(post) {
        delete post.comments;
        res.status(200).json(post);
      } else {
        res.status(400).json('Post not found');
      }
    })
    .catch((err) => res.status(400).json('forum not found'));
});

router.post("/comments", isLoggedIn, (req, res) => {
  const { forumId, postId } = req.body;

  Forum.findOne({ _id: forumId })
    .then(async (forum) => {
      const post = forum.posts.find((post) => post._id === postId);
      if(post) {
        const updatedComments = await updateCommentsWithProfileImages(post.comments);
        res.status(200).json(updatedComments);
      } else {
        res.status(400).json('Post not found');
      }
    })
    .catch((err) => res.status(400).json('forum not found'));
});

module.exports = router;
