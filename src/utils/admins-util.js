const jwt_decode = require("jwt-decode");
const User = require("./../models/User");
const Profile = require("./../models/Profile");
const Forum = require("./../models/Forum");
const Course = require("./../models/Course");

function getUniversityOfUser(jwt) {
    const { id } = jwt_decode(jwt);
  
    let res = User.findOne({ _id: id }).then((user) => {
      return user.universityName;
    });
    return res;
  }
  
  function getMappedCourses(courses) {
    return courses.map((course) => {
      return {
        id: course._id,
        courseName: course.courseName,
        degreeName: course.degreeName,
        universityName: course.universityName,
      };
    });
  }
  
  function deleteCourseFromProfiles(course) {
    Profile.find({university_name: course.universityName, degree_name: course.degreeName}).then(profiles => {
      profiles.forEach(async profile => {
        const updatedCourses = profile.courses.filter(theCourse => theCourse.id != course._id.toString() );
        if(updatedCourses.length != profile.courses.length){
          await Profile.update({_id:profile._id}, {courses:updatedCourses});
        }
      })
    })
  }
  
  function createForumAndSaveToDB(courseName, universityName, courseId) {
    const newForum = new Forum({
      forumName: `${courseName} Forum`,
      forumType: 'course',
      universityName,
      courseName,
      courseId,
      posts: [],
    });
  
    newForum
        .save()
        .then(() => {})
        .catch((err) => console.log(err));
  }
  
  function addCourse(universityName, degreeName, courseName) {
    let res = Course.findOne({ universityName, degreeName, courseName }).then(
      (course) => {
        if (course) {
          return Promise.resolve(null);
        }
  
        const newCourse = new Course({
          courseName,
          degreeName,
          universityName,
        });
  
        return newCourse.save();
      }
    );
    return res;
  }

  module.exports = { getUniversityOfUser, getMappedCourses, deleteCourseFromProfiles, createForumAndSaveToDB, addCourse };