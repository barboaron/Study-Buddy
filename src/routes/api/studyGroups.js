/* This route contains actions related to study groups such as create study group,
 update study group, create a managed survey etc */

const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const StudyGroup = require("../../models/StudyGroup");
const jwt_decode = require("jwt-decode");
const { isLoggedIn, isInGroup } = require("../../authentication/auth");
const multer = require("multer");
const { storage } = require("./../../utils/multer-util");

const { filterGroupsByCourses, createStudyGroupObj, isAdminOfGroup, validateGroupDetails, 
  createStudyGroupsRes, getMyGroups, updatePostsWithProfileImages,
  createFilePaths, createNewPostObj, createSurvey, initSurveyParticipants, filterStudyGroup, deletePostFromGroup, 
  findWinningDate, createUpdatedSurvey, didSurveyEnd 
} = require('./../../utils/studyGroups-util');

var upload = multer({ storage: storage });

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

  const newStudyGroup = createStudyGroupObj(req.body, participants, name, id);
  newStudyGroup
    .save()
    .then((studyGroup) => res.json(studyGroup))
    .catch((err) => console.log(err));
});

router.post("/updateGroup", isLoggedIn, isInGroup, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;
  
  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      
      if(!isAdminOfGroup(studyGroup, id)) {
        res.status(401).json("Only group admin can update group details");
      }
      
      if (req.body.updateData.maxParticipants) {
        if (req.body.updateData.maxParticipants < studyGroup.participants.length)
          res.status(400).json("Can't set the maximum participants to less than amount of participants in group");
      }

      StudyGroup.updateOne({ _id: groupId }, req.body.updateData)
      .then(() => {
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

router.post("/", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const page = req.body.page || 1;

  Profile.findOne({ user_id: id })
    .then((profile) => {
      const courses = profile.courses;
      StudyGroup.find({ isFull: false })
        .then((studyGroups) => {
          let filteredStudyGroups = filterGroupsByCourses(studyGroups, courses); 

          if (req.body.filters) {
            filteredStudyGroups = filterStudyGroup(filteredStudyGroups, req.body.filters);
          }

          const paginatedData = filteredStudyGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
          const resolvedData = createStudyGroupsRes(paginatedData, id);
          const hasMoreGroups = filteredStudyGroups.length / PAGE_SIZE - page > 0;

          res.status(200).json({ studyGroups: resolvedData, hasNextPage: hasMoreGroups });
        })
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/group", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;
  getMyGroups(id)
    .then((groups) => {
      const requestedGroup = groups.find(
        (group) => group._id.toString() === groupId
      );
      res.status(200).json({ group: requestedGroup });
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

router.post("/deleteGroup", isLoggedIn, isInGroup, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;

  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      if(!isAdminOfGroup(studyGroup, id)) {
        res.status(401).json("Only group admin can delete a group");
      }

      StudyGroup.deleteOne({ _id: groupId }).then(() => {
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
      if (isAdminOfGroup(studyGroup, id)) {
        res.status(400).json("Group admin can't leave the group");
      }
      
      const updatedParticipants = studyGroup.participants.filter((participant) => participant.id !== id);

      StudyGroup.updateOne(
        { _id: groupId },
        { participants: updatedParticipants }
      ).then(() => {
        getMyGroups(id)
          .then((groups) => {
            res.status(200).json({ studyGroups: groups });
          })
          .catch((err) => res.status(400).json(err));
      });
    })
    .catch((err) => res.status(400).json(err));
});

router.post("/addPost", upload.array("file", 5), isLoggedIn, isInGroup,(req, res) => {
    const { id, name } = jwt_decode(req.body.jwt);
    const { content, groupId } = req.body;
    if (!content) {
      return res.status(400).json("content is required");
    }

    Profile.findOne({ user_id: id })
      .then((profile) => {
        StudyGroup.findOne({ _id: groupId })
          .then((studyGroup) => {
            const filePaths = createFilePaths(req.files);
            const post = createNewPostObj(content, name, id, profile._id.toString(), filePaths);
            
            StudyGroup.updateOne(
              { _id: groupId },
              { posts: studyGroup.posts.concat(post) }
            )
              .then(async () => {
                const updatedPosts = await updatePostsWithProfileImages(studyGroup.posts.concat(post));
                res.status(200).json(updatedPosts);
              })
              .catch((err) =>
                res.status(400).json("study group update failed")
              );
          })
          .catch((err) => res.status(400).json("study group not found"));
      })
      .catch((err) => res.status(400).json("profile not found"));
  }
);

router.post("/deletePost", isLoggedIn, isInGroup, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const { postId, groupId } = req.body;

  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      deletePostFromGroup(id, studyGroup, postId)
        .then((posts) => {
          StudyGroup.updateOne({ _id: groupId }, { posts })
            .then(async () => {
              const updatedPosts = await updatePostsWithProfileImages(posts);
              res.status(200).json(updatedPosts);
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
    .then(async (studyGroup) => {
      const updatedPosts = await updatePostsWithProfileImages(studyGroup.posts);
      res.status(200).json(updatedPosts);
    })
    .catch(() => res.status(400).json("study group not found"));
});

router.post("/createSurvey", isLoggedIn, isInGroup, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const { groupId } = req.body;

  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      if(!isAdminOfGroup(studyGroup, id)) {
        res.status(400).json("only group admin can create a survey");
      }

      const survey = createSurvey(req.body.dates); 
      const updatedParticipants = initSurveyParticipants(studyGroup.participants); 
      
      StudyGroup.updateOne(
        { _id: groupId },
        { survey, participants: updatedParticipants }
      ).then(() => res.status(200).json(survey));
    })
    .catch(() => res.status(400).json("study group not found"));
});

router.post("/answerSurvey", isLoggedIn, isInGroup, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const { groupId } = req.body;

  StudyGroup.findOne({ _id: groupId })
    .then((studyGroup) => {
      const requester = studyGroup.participants.find((participant) => participant.id === id);
      if (requester.isCreator) {
        res.status(400).json("group admin can't answer the survey");
      }
        if (requester.didAnswerSurvey) {
        res.status(400).json("user already answered the survey");
      } 
      const updatedSurvey = createUpdatedSurvey(studyGroup.survey, req.body.dates); 
      const updatedParticipants = studyGroup.participants.map((participant) => {
          if (participant.isCreator || participant.id !== id)
            return participant;
          return { ...participant, didAnswerSurvey: true };
        }
      );

      StudyGroup.updateOne({ _id: groupId }, { survey: updatedSurvey, participants: updatedParticipants }
      ).then(() => {
        if (didSurveyEnd(updatedParticipants)) {
          //everyone answered
          const winningDate = findWinningDate(updatedSurvey);
          const updatedParticipants = initSurveyParticipants(studyGroup.participants)
          StudyGroup.updateOne(
            { _id: groupId },
            {
              survey: [],
              date: winningDate,
              participants: updatedParticipants,
            }
          ).then(() => {
            res.status(200).json({ surveyEnded: true });
          });
        } else {
          res.status(200).json({ surveyEnded: false });
        }
      });
  })
  .catch((err) => res.status(400).json(err));
});



module.exports = router;
