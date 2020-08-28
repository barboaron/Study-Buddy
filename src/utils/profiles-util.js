const defaultImgSrc = '/defaultPicUser.png';
const isEmpty = require("is-empty");
const Course = require("./../models/Course");

function filterDegrees(courseObjects) {
    const degreeNames = courseObjects.map((courseObject) => {
      return courseObject.degreeName;
    });
    const degreesSet = new Set(degreeNames);
    return Array.from(degreesSet);
  }
  
  function convertProfile(profile, id) {
    let convertedProfile = JSON.parse(JSON.stringify(profile));
  
    if (id === profile.user_id) {
      convertedProfile.canEdit = true;
    } else {
      convertedProfile.canEdit = false;
      delete convertedProfile.study_groups;
    }
    if(!profile.imgSrc) {
      convertedProfile.imgSrc = defaultImgSrc;
    }
    return convertedProfile;
  }
  
  async function validateProfileDetails(data, universityName) {
    let errors = {};
    if (isEmpty(data.degree_name)) {
      errors.degree = "Degree name field is required";
    } else {
      await Course.find({ universityName })
        .then((coursesArray) => {
          const degrees = filterDegrees(coursesArray);
          if (!degrees.includes(data.degree_name.toLowerCase())) {
            errors.degree = "Degree doesnt exist in your university";
          }
        })
        .catch((err) => res.status(400).json(err));
    }
    if (isEmpty(data.year_of_study))
      errors.year_of_study = "Year of study field is required";
    else if (data.year_of_study < 1 || data.year_of_study > 7) {
      errors.year_of_study = "Year of study must be between 1 and 7";
    }
  
    return {
      errors,
      isValid: isEmpty(errors),
    };
  }
  
  function filterAndFormatCourses(coursesIds, allCourses) {
    if (!(coursesIds === undefined || coursesIds.length === 0)) {
      const filteredCourses = allCourses.filter((course) => {
        return coursesIds.includes(course._id.toString());
      });
  
      return filteredCourses.map((course) => {
        return {
          id: course._id,
          name: course.courseName,
        };
      });
    } else {
      return [];
    }
  }

  module.exports = { filterDegrees, convertProfile, validateProfileDetails, filterAndFormatCourses };