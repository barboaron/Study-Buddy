const { v4: uuidv4 } = require('uuid');
var fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Profile = require("./../models/Profile");

function filterForumsByUserCourses(courses, forums) {
    return forums.filter((forum) => {
      return courses
        .map((course) => course.id.toString())
        .includes(forum.courseId.toString());
    });
  }

function createFilePaths(files) {
return files ?
    ( files.map((file) => {
        const isImage = isImageFile(file.path);
        return {
        path: file.path.substr(7),
        isImage,
        };
    }))
    : [];
}
  
function createPost(title, content, type, name, id, filePaths) {
return {
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
}

function createNewComment(comment, name, id, creatorProfileId, filePaths) {
    return {
        _id: uuidv4(),
        creationDate: Date.now(),
        content: comment,
        creatorName: name,
        creatorId: id,
        creatorProfileId,
        files: filePaths,
        };
}
 
 function isImageFile(path) {
   return path.endsWith("jpg") || path.endsWith("jpeg") || path.endsWith("png") || path.endsWith("jpe")
        || path.endsWith("jif") || path.endsWith("jfif") || path.endsWith("jfi") || path.endsWith("gif");
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

  module.exports = { filterForumsByUserCourses, createFilePaths, createPost, createNewComment, isImageFile, updateCommentsWithProfileImages, createCommentWithImg, addCommentToPost, deleteCommentFromPost, deletePostFromForum };