const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Course = require("../../models/Course");
const StudyGroup = require("../../models/StudyGroup");
const jwt_decode = require("jwt-decode");
const { isLoggedIn, isInGroup } = require("../../authentication/auth");
const isEmpty = require("is-empty");
const { v4: uuidv4 } = require("uuid");

const PAGE_SIZE = 9;
const studyGroupTypes = ["Project", "Homework", "Exam Study"];

router.post("/types", isLoggedIn, (req, res) => {
  res.json(studyGroupTypes);
});

router.post("/create", isLoggedIn, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const participants = [{ name, id, isCreator: true }];

  const { errors, isValid } = validateGroupDetails(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const newStudyGroup = new StudyGroup({
    participants,
    courseName: req.body.courseName,
    courseId: req.body.courseId,
    groupName: req.body.groupName,
    groupType: req.body.groupType,
    description: req.body.description,
    maxParticipants: req.body.numberOfParticipants,
    questions: req.body.questions,
    date: req.body.dateAndTime || null,
    isFull: false,
    creatorName: name,
    creatorId: id,
    pendingUsers: [],
    posts: [],
    survey: null,
  });
  newStudyGroup
    .save()
    .then((studyGroup) => res.json(studyGroup))
    .catch((err) => console.log(err));
});

router.post("/updateGroup", isLoggedIn, isInGroup, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;
  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      studyGroup.participants.forEach((participant) => {
        if (participant.id.toString() === id.toString()) {
          if (!participant.isCreator) {
            res.status(401).json("Only group admin can update group details");
          }
        }
      });
      if (req.body.updateData.maxParticipants) {
        if (
          req.body.updateData.maxParticipants < studyGroup.participants.length
        )
          res
            .status(400)
            .json(
              "Can't set the maximum participants to less than amount of participants in group"
            );
      }

      StudyGroup.updateOne({ _id: groupId }, req.body.updateData).then(
        (groupDet) => {
          getMyGroups(id)
            .then((groups) => {
              res.status(200).json({ studyGroups: groups });
            })
            .catch((err) => res.status(400).json(err));
        }
      );
    })
    .catch((err) => res.status(400).json(err));
});

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

router.post("/", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const page = req.body.page || 1;

  Profile.findOne({ user_id: id })
    .then((profile) => {
      const courses = profile.courses;
      let filteredRes = null;
      StudyGroup.find({ isFull: false })
        .then((studyGroups) => {
          let filteredStudyGroups = studyGroups.filter((studyGroup) => {
            return courses
              .map((course) => course.id.toString())
              .includes(studyGroup.courseId.toString());
          });
          if (req.body.filters) {
            filteredStudyGroups = filterStudyGroup(
              filteredStudyGroups,
              req.body.filters
            );
          }
          const paginatedData = filteredStudyGroups.slice(
            (page - 1) * PAGE_SIZE,
            page * PAGE_SIZE
          );
          const resolvedData = paginatedData.map((group) => {
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

          const hasMoreGroups =
            filteredStudyGroups.length / PAGE_SIZE - page > 0;
          res
            .status(200)
            .json({ studyGroups: resolvedData, hasNextPage: hasMoreGroups });
        })
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/myGroups", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  getMyGroups(id)
    .then((groups) => {
      res.status(200).json({ studyGroups: groups });
    })
    .catch((err) => res.status(400).json(err));
});

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

router.post("/deleteGroup", isLoggedIn, isInGroup, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;

  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      studyGroup.participants.forEach((participant) => {
        if (participant.id.toString() === id) {
          if (!participant.isCreator) {
            res.status(401).json("Only group admin can delete a group");
          }
        }
      });

      StudyGroup.deleteOne({ _id: groupId }).then((deleteInfo) => {
        getMyGroups(id)
          .then((groups) => {
            res.status(200).json({ studyGroups: groups });
          })
          .catch((err) => res.status(400).json(err));
      });
    })
    .catch((err) => res.status(400).json("group does not exist"));
});

router.post("/leaveGroup", isLoggedIn, isInGroup, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;

  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      let isAdmin = false;
      studyGroup.participants.forEach((participant) => {
        if (participant.id === id) {
          isAdmin = participant.isCreator;
        }
      });
      if (isAdmin) res.status(400).json("Group admin can't leave the group");
      const updatedParticipants = studyGroup.participants.filter(
        (participant) => participant.id !== id
      );

      StudyGroup.updateOne(
        { _id: groupId },
        { participants: updatedParticipants }
      ).then((groupDet) => {
        getMyGroups(id)
          .then((groups) => {
            res.status(200).json({ studyGroups: groups });
          })
          .catch((err) => res.status(400).json(err));
      });
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/addPost", isLoggedIn, isInGroup, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const { content, groupId } = req.body;

  if (!content) {
    return res.status(400).json("content is required");
  }
  Profile.findOne({ user_id: id })
    .then((profile) => {
      StudyGroup.findOne({ _id: groupId })
        .then((studyGroup) => {
          const post = {
            _id: uuidv4(),
            creationDate: Date.now(),
            content,
            creatorName: name,
            creatorId: id,
            creatorImgSrc: profile.imgSrc,
            //files??
          };
          StudyGroup.updateOne(
            { _id: groupId },
            { posts: studyGroup.posts.concat(post) }
          )
            .then(() => {
              res.status(200).json(studyGroup.posts.concat(post));
            })
            .catch((err) => res.status(400).json("study group update failed"));
        })
        .catch((err) => res.status(400).json("study group not found"));
    })
    .catch((err) => res.status(400).json("profile not found"));
});

router.post("/deletePost", isLoggedIn, isInGroup, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const { postId, groupId } = req.body;


  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      deletePostFromGroup(id, studyGroup, postId)
        .then((posts) => {
          StudyGroup.updateOne({ _id: groupId }, { posts })
            .then(() => {
              res.status(200).json(postId);
            })
            .catch(() => res.status(400).json("study group update failed"));
        })
        .catch((err) => res.status(401).json(err));
    })
    .catch(() => res.status(400).json("study group not found"));
});

router.post("/posts", isLoggedIn, isInGroup, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const { groupId } = req.body;

  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      res.status(200).json(studyGroup.posts);
    })
    .catch(() => res.status(400).json("study group not found"));
});

router.post("/createSurvey", isLoggedIn, isInGroup, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const { groupId } = req.body;

  StudyGroup.findOne({_id: groupId}).then(studyGroup => {
    
    const requester = studyGroup.participants.find(participant => participant.id === id)
    if(!requester.isCreator) {
      res.status(400).json("only group admin can create a survey");
    } else {
      const survey = req.body.dates.map(date => {
        return {
          date,
          votes: 0
        }
      })
      const updatedParticipants = studyGroup.participants.map(participant => {
        if(participant.isCreator) return participant;
        return {...participant, didAnswerSurvey: false }
      })
      StudyGroup.updateOne({_id: groupId}, { survey, participants: updatedParticipants }).then(() => res.status(200).json(survey));
    }
  })
  .catch(() => res.status(400).json("study group not found"));
})

router.post("/answerSurvey", isLoggedIn, isInGroup, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const { groupId } = req.body;

  StudyGroup.findOne({_id: groupId}).then(studyGroup => {
    const requester = studyGroup.participants.find(participant => participant.id === id);
    if(requester.isCreator) {
      res.status(400).json("group admin can't answer the survey");
    } else if(requester.didAnswerSurvey) {
      res.status(400).json("user already answered the survey");
    } 
    else {
      const updatedSurvey = studyGroup.survey.map(dateAndVotesObj => {
        if(req.body.dates.includes(dateAndVotesObj.date)){
          return {
            date: dateAndVotesObj.date,
            votes: dateAndVotesObj.votes + 1
          }
        }
        return dateAndVotesObj;
      });
      const updatedParticipants = studyGroup.participants.map(participant => {
        if(participant.isCreator || participant.id !== id) return participant;
        return {...participant, didAnswerSurvey: true };
      })
      StudyGroup.updateOne({_id: groupId}, { survey: updatedSurvey, participants: updatedParticipants }).then(() => {
        
        if(didSurveyEnd(updatedParticipants)){ //everyone answered
          const winningDate = findWinningDate(updatedSurvey);
          const updatedParticipants = studyGroup.participants.map(participant => {
            if(participant.isCreator) return participant;
            return {...participant, didAnswerSurvey: false }
          })
          StudyGroup.updateOne({_id: groupId}, { survey: null, date: winningDate, participants: updatedParticipants }).then(() => {
            res.status(200).json({surveyEnded: true});
          });
        }
        else {
          res.status(200).json({surveyEnded: false});
        }
      });
    }
  })
  .catch(() => res.status(400).json("study group not found"));
})

function didSurveyEnd(participants) {
  let didEnd = true;
  participants.forEach(participant => {
    if(!participant.isCreator && !partricipant.didAnswerSurvey) {
      didEnd = false;
    }
  })
  return didEnd;
}

function findWinningDate(survey) {
  let winningDate = survey[0];
  for(let i = 1; i < survey.length; i++){
    if(survey[i].votes > winningDate.votes){
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

module.exports = router;
