const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Course = require("../../models/Course");
const StudyGroup = require("../../models/StudyGroup");
const jwt_decode = require("jwt-decode");
const { isLoggedIn } = require("../../authentication/auth");
const isEmpty = require("is-empty");

const studyGroupTypes = ["Project", "Homework", "Exam Study"];

router.post("/types", isLoggedIn, (req, res) => {
    res.json(studyGroupTypes);
  });

  router.post("/create", isLoggedIn, (req, res) => {
    const {id, name} = jwt_decode(req.body.jwt);
    const participants = [{name, id, isCreator: true}];

    const { errors, isValid } = validateGroupDetails(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    
    const newStudyGroup = new StudyGroup({
        participants,
        courseName: req.body.courseName,
        courseId: req.body.courseId,
        groupType: req.body.groupType,
        description: req.body.description,
        maxParticipants: req.body.numberOfParticipants,
        questions: req.body.questions,
        date: req.body.dateAndTime || null 
    })
    newStudyGroup
        .save()
        .then((studyGroup) => res.json(studyGroup))
        .catch((err) => console.log(err));
  });

function validateGroupDetails(studyGroup) {
    let errors = {};
    if(studyGroup.numberOfParticipants > 10 || studyGroup.numberOfParticipants < 2)
        errors.numberOfParticipants = "Number of participants must be between 2 and 10";

    if(!studyGroupTypes.includes(studyGroup.groupType))
        errors.studyGroupType = "illegal study group type";

    return {
        errors,
        isValid: isEmpty(errors)
        };
}



  module.exports = router;