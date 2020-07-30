const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Course = require("../../models/Course");
const StudyGroup = require("../../models/StudyGroup");
const jwt_decode = require("jwt-decode");
const { isLoggedIn } = require("../../authentication/auth");
const isEmpty = require("is-empty");

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
  });
  newStudyGroup
    .save()
    .then((studyGroup) => res.json(studyGroup))
    .catch((err) => console.log(err));
});

router.post("/updateGroup", isLoggedIn, (req, res) => {
  const { id, name } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;
  StudyGroup.findOne({_id: groupId}).then(async studyGroup => {   
    let isInGroup = false; 
    studyGroup.participants.forEach(participant => {
      if(participant.id === id) {
        isInGroup = true;
        if(!participant.isCreator){
          res.status(401).json("Only group admin can update group details");
        }
      }
    })
    if(!isInGroup) res.status(401).json("User is not in the group");
    if(req.body.updateData.maxParticipants){
      if(req.body.updateData.maxParticipants < group.participants.length)
        res.status(400).json("Can't set the maximum participants to less than amount of participants in group");
    }

    await StudyGroup.updateOne({_id : groupId}, req.body.updateData);
  }).catch((err) => res.status(400).json(err));
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
          const resolvedData = paginatedData.map(group => {
              let isInGroup = false;
              group.participants.forEach(participant => {
                  if(participant.id === id) {
                      isInGroup = true;
                  }
              });
              return {...group._doc, isInGroup};
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
  StudyGroup.find({}).then(studyGroups => {
    const myGroups = studyGroups.filter(group => {
      return group.participants.map(participant => participant.id.toString()).includes(id.toString());
    });
    const resolvedData = myGroups.map(group => {
      let isAdmin = false;
      group.participants.forEach(participant => {
          if(participant.id === id) {
              if(participant.isCreator)
                isAdmin = true;
          }
      });
      return {...group._doc, isAdmin};
  });
     res
    .status(200)
    .json({ studyGroups: resolvedData});
  }).catch((err) => res.status(400).json(err));
})

router.post("/deleteGroup", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;

  StudyGroup.findOne({_id: groupId}).then(studyGroup => {   
    let isInGroup = false; 
    studyGroup.participants.forEach(participant => {
      if(participant.id === id) {
        isInGroup = true;
        if(!participant.isCreator){
          res.status(401).json("Only group admin can delete a group");
        }
      }
    })
    if(!isInGroup) res.status(401).json("User is not in the group");

    StudyGroup.deleteOne({_id : groupId}).then(deleteInfo => {
      res.status(200).json("group was deleted successfuly");
    });
  }).catch((err) => res.status(400).json(err));
})

router.post("/leaveGroup", isLoggedIn, (req, res) => {
  const { id } = jwt_decode(req.body.jwt);
  const groupId = req.body.groupId;

  StudyGroup.findOne({_id: groupId}).then(async studyGroup => {    
    let foundUser = false;
    let isAdmin = false;
    studyGroup.participants.forEach(participant => {
      if(participant.id === id) {
        foundUser = true;
        isAdmin = participant.isCreator;
      }
    })
    if(!foundUser) res.status(400).json("User isn't in the group");
    if(isAdmin) res.status(400).json("Group admin can't leave the group");
    const updatedParticipants = studyGroup.participants.filter(participant => participant.id !== id);

    await StudyGroup.updateOne({_id : groupId}, {participants: updatedParticipants});
  }).catch((err) => res.status(400).json(err));
})

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
