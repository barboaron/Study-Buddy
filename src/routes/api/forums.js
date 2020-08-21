const express = require("express");
const router = express.Router();
// const Course = require("../../models/Course");
const Forum = require("../../models/Forum");
const Profile = require("../../models/Profile");
const { isLoggedIn } = require("../../authentication/auth");
const jwt_decode = require("jwt-decode");
const { validatePostInput, validateCommentInput, postTypes } = require("../../validation/post");
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");
var fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage });

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
      const filePaths = req.files ? req.files.map((file) => file.path.substr(7)) : [];
      const post = {
        _id: uuidv4(),
        creationDate: Date.now(),
        title,
        content,
        type,
        creatorName: name,
        creatorId: id,
        comments: [],
        files: filePaths,
      };
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
        const filePaths = req.files.map((file) => {
          const isImage = isImageFile(file.path);
          return {
            path: file.path.substr(7),
            isImage,
          };
        });
        const newComment = {
          _id: uuidv4(),
          creationDate: Date.now(),
          content: comment,
          creatorName: name,
          creatorId: id,
          // imgSrc: profile.imgSrc,
          creatorProfileId: profile._id.toString(),
          files: filePaths,
        };

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

function isImageFile(path) {
  return path.endsWith("jpg") || path.endsWith("jpeg") || path.endsWith("png");
}

function updateCommentsWithProfileImages(comments) {
  const promises = comments.map(async comment => {
    return await createCommentWithImg(comment);
  })
  return Promise.all(promises).catch(err => console.log(err));
  
}

function createCommentWithImg(comment) {
  return new Promise((resolve, reject) => {
    Profile.findOne({_id: comment.creatorProfileId}).then(profile => {
      resolve({...comment, creatorImgSrc: profile.imgSrc});
    })
    .catch(err => reject({err}))
  })
}

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

function addCommentToPost(forum, postId, newComment) {
  return forum.posts.map(post => {
    if(post._id === postId) {
      return {...post, comments: post.comments.concat(newComment)};
    } else {
      return post;
    }
  });
}

function deleteCommentFromPost(userId, forum, postId, commentId) {
  return new Promise( (resolve, reject) => { 
    const posts = forum.posts.map(post => {
      if(post._id === postId) {
        post.comments.forEach(comment => {
          if(comment._id === commentId) {
            if(comment.creatorId !== userId) {
              reject('only comment creator can delete');
            }
            else {
              comment.files.forEach(async fileObj => {
                await unlinkAsync(`./public/${fileObj.path}`);
              });
            }
          }
        });
        return {...post, comments: post.comments.filter(comment => comment._id !== commentId)};
      } else {
        return post;
      }
    });
    resolve(posts);
  });
}

function deletePostFromForum(userId, forum, postId) {
  return new Promise( (resolve, reject) => { 
    forum.posts.forEach(post => {
      if(post._id === postId) {
        if(post.creatorId !== userId) {
          reject('only post creator can delete');
        }
      }
    });

    const posts = forum.posts.filter(post => {
      return post._id !== postId;
    });

    resolve(posts);
  });
}


module.exports = router;
