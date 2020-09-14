const { v4: uuidv4 } = require("uuid");
var fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Profile = require("./../models/Profile");
const isEmpty = require("is-empty");
const StudyGroup = require("./../models/StudyGroup");
const studyGroupTypes = ["Project", "Homework", "Exam Study"];

function createUpdatedSurvey(survey, dates) {
    return survey.map((dateAndVotesObj) => {
      if (dates.includes(dateAndVotesObj.date)) {
        return {
          date: dateAndVotesObj.date,
          votes: dateAndVotesObj.votes + 1,
        };
      }
      return dateAndVotesObj;
    });
  }
  
  function didSurveyEnd(participants) {
    let didEnd = true;
    participants.forEach((participant) => {
      if (!participant.isCreator && !participant.didAnswerSurvey) {
        didEnd = false;
      }
    });
    return didEnd;
  }
  
  function findWinningDate(survey) {
    let winningDate = survey[0];
    for (let i = 1; i < survey.length; i++) {
      if (survey[i].votes > winningDate.votes) {
        winningDate = survey[i];
      }
    }
    return winningDate.date;
  }
  
  function deletePostFromGroup(userId, studyGroup, postId) {
    return new Promise((resolve, reject) => {
      studyGroup.posts.forEach((post) => {
        if (post._id === postId) {
          if (post.creatorId !== userId) {
            reject("only post creator can delete");
          }
          else {
            post.files.forEach(async fileObj => {
              await unlinkAsync(`./public/${fileObj.path}`);
            })
          }
        }
      });
  
      const posts = studyGroup.posts.filter((post) => {
        return post._id !== postId;
      });
      resolve(posts);
    });
  }
  
  function filterStudyGroup(studyGroups, filters) {
    let f1, f2, f3, f4;
    f1 =
      filters.courseName && filterByCourseName(studyGroups, filters.courseName);
    f1
      ? (f2 = filters.groupType && filterByGroupType(f1, filters.groupType))
      : (f2 =
          filters.groupType && filterByGroupType(studyGroups, filters.groupType));
    f2
      ? (f3 = filters.date && filterByDate(f2, filters.date))
      : f1
      ? (f3 = filters.date && filterByDate(f1, filters.date))
      : filters.date && filterByDate(studyGroups, filters.date);
    f3
      ? (f4 =
          filters.numOfParticipant &&
          filterByNumOfParticipant(f3, filters.numOfParticipant))
      : f2
      ? (f4 =
          filters.numOfParticipant &&
          filterByNumOfParticipant(f2, filters.numOfParticipant))
      : f1
      ? (f4 =
          filters.numOfParticipant &&
          filterByNumOfParticipant(f1, filters.numOfParticipant))
      : (f4 =
          filters.numOfParticipant &&
          filterByNumOfParticipant(studyGroups, filters.numOfParticipant));
  
    return f4 || f3 || f2 || f1 || studyGroups;
  }
  
  function filterByCourseName(filteredStudyGroups, courseName) {
    return filteredStudyGroups.filter((studyGroup) => {
      return studyGroup.courseName === courseName;
    });
  }
  
  function filterByGroupType(filteredStudyGroups, groupType) {
    return filteredStudyGroups.filter((studyGroup) => {
      return studyGroup.groupType === groupType;
    });
  }
  
  function filterByDate(filteredStudyGroups, date) {
    return filteredStudyGroups.filter((studyGroup) => {
      return (
        studyGroup.date.getDate() === date.getDate() &&
        studyGroup.date.getMonth() === date.getMonth() &&
        studyGroup.date.getYear() === date.getYear()
      );
    });
  }
  
  function filterByNumOfParticipant(filteredStudyGroups, numOfParticipants) {
    return filteredStudyGroups.filter((studyGroup) => {
      return studyGroup.maxParticipants <= numOfParticipants;
    });
  }

  function initSurveyParticipants(participants) {
    return participants.map((participant) => {
      if (participant.isCreator) return participant;
        return { ...participant, didAnswerSurvey: false };
    }
  );
  }
  
  function createSurvey(dates) {
    return dates.map((date) => {
      return {
        date,
        votes: 0,
      };
    });
  }

  function createNewPostObj(content, creatorName, creatorId, creatorProfileId, files) {
    content = content ? content : ""
    return {
      _id: uuidv4(),
      creationDate: Date.now(),
      content,
      creatorName,
      creatorId,
      creatorProfileId,
      files,
    };
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
  
  function updatePostsWithProfileImages(posts) {
    const promises = posts.map(async post => {
      return await createPostWithImg(post);
    })
    return Promise.all(promises).catch(err => console.log(err));
    
  }
  
  function createPostWithImg(post) {
    return new Promise((resolve, reject) => {
      Profile.findOne({_id: post.creatorProfileId}).then(profile => {
        resolve({...post, creatorImgSrc: profile.imgSrc});
      })
      .catch(err => reject({err}))
    })
  }
  
  function isImageFile(path) {
    return path.endsWith("jpg") || path.endsWith("jpeg") || path.endsWith("png") || path.endsWith("jpe")
         || path.endsWith("jif") || path.endsWith("jfif") || path.endsWith("jfi") || path.endsWith("gif");
  }

  function getMyGroups(id) {
    let ret = StudyGroup.find({})
      .then((studyGroups) => {
        const myGroups = studyGroups.filter((group) => {
          return group.participants
            .map((participant) => participant.id.toString())
            .includes(id);
        });
        const resolvedData = myGroups.map((group) => {
          let isAdmin = false;
          let didAnswerSurvey;
          group.participants.forEach((participant) => {
            if (participant.id.toString() === id) {
              if (participant.isCreator) isAdmin = true;
              didAnswerSurvey = participant.didAnswerSurvey;
            }
          });
          return { ...group._doc, isAdmin, didAnswerSurvey };
        });
        return Promise.resolve(resolvedData);
      })
      .catch((err) => {
        throw err;
      });
    return ret;
  }

  function createStudyGroupsRes(paginatedData, id) {
    return paginatedData.map((group) => {
      let isInGroup = false;
      let isPending = false;
      group.participants.forEach((participant) => {
        if (participant.id.toString() === id.toString()) {
          isInGroup = true;
        }
      });
  
      group.pendingUsers.forEach((userId) => {
        if (userId === id) {
          isPending = true;
        }
      });
  
      return { ...group._doc, isInGroup, isPending };
    });
  }
  
  function filterGroupsByCourses(studyGroups, courses) {
    const mappedCourses = courses.map((course) => course.id.toString());
    
    return studyGroups.filter((studyGroup) => {
      return mappedCourses.includes(studyGroup.courseId.toString());
    });
  }

  function isAdminOfGroup(studyGroup, id) {
    const participant = studyGroup.participants.find(p => p.id.toString() === id.toString())
    return participant ? participant.isCreator : false;
  }
  
  function validateGroupDetails(studyGroup) {
    let errors = {};
    if (
      studyGroup.numberOfParticipants > 10 ||
      studyGroup.numberOfParticipants < 2
    )
      errors.numberOfParticipants =
        "Number of participants must be between 2 and 10";
  
    if (!studyGroupTypes.includes(studyGroup.groupType))
      errors.studyGroupType = "illegal study group type";
  
    return {
      errors,
      isValid: isEmpty(errors),
    };
  }

  function createStudyGroupObj(data, participants, creatorName, creatorId) {
    return new StudyGroup({
      participants,
      courseName: data.courseName,
      courseId: data.courseId,
      groupName: data.groupName,
      groupType: data.groupType,
      description: data.description,
      maxParticipants: data.numberOfParticipants,
      questions: data.questions,
      date: data.dateAndTime || null,
      isFull: false,
      creatorName,
      creatorId,
      pendingUsers: [],
      posts: [],
      survey: [],
    });
  }

  module.exports = { filterGroupsByCourses, createStudyGroupObj, isAdminOfGroup, validateGroupDetails, 
    createStudyGroupsRes, getMyGroups, isImageFile, createPostWithImg, updatePostsWithProfileImages,
    createFilePaths, createNewPostObj, createSurvey, initSurveyParticipants, filterByNumOfParticipant, 
    filterByDate, filterByGroupType, filterStudyGroup, filterByCourseName, deletePostFromGroup, 
    findWinningDate, createUpdatedSurvey, didSurveyEnd 
  }