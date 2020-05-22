const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Course = require("../../models/Course");
const StudyGroup = require("../../models/StudyGroup");
const jwt_decode = require("jwt-decode");
const { isLoggedIn } = require("../../authentication/auth");
const isEmpty = require("is-empty");

const PAGE_SIZE = 10;
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
        date: req.body.dateAndTime || null,
        isFull: false,
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

router.post("/", isLoggedIn, (req, res) => {
    const { id } = jwt_decode(req.body.jwt);
	const page = req.body.page || 1;

    Profile.findOne({ user_id: id} ).then( profile => {
        const courses = profile.courses;
        StudyGroup.find({ isFull: false }).then( studyGroups => {
            const filteredStudyGroups = studyGroups.filter( studyGroup => {
                return courses
                        .map( course => course.id.toString())
                        .includes(studyGroup.courseId.toString());   
            });
            if(req.body.filters.courseName) 
                filteredStudyGroups = filterByCourseName(filteredStudyGroups, req.body.filters.courseName);
            if(req.body.filters.groupType) 
                filteredStudyGroups = filterByGroupType(filteredStudyGroups, req.body.filters.groupType);
            if(req.body.filters.date) 
                filteredStudyGroups = filterByDate(filteredStudyGroups, req.body.filters.date);
            if(req.body.filters.numOfParticipant) 
                filteredStudyGroups = filterByNumOfParticipant(filteredStudyGroups, req.body.filters.numOfParticipant);
            const paginatedData = filteredStudyGroups
                .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
            const hasMoreGroups = (filteredStudyGroups.length / PAGE_SIZE) - page > 0;
            res.status(200).json({ studyGroups: paginatedData, hasNextPage: hasMoreGroups })
        })
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
});

function filterByCourseName(filteredStudyGroups, courseName) {
    return filteredStudyGroups.filter( studyGroup => {
        return studyGroup.courseName === courseName;
    });
}

function filterByGroupType(filteredStudyGroups, groupType) {
    return filteredStudyGroups.filter( studyGroup => {
        return studyGroup.groupType === groupType;
    });
}

function filterByDate(filteredStudyGroups, date) {
    return filteredStudyGroups.filter( studyGroup => {
        return studyGroup.date.getDate() === date.getDate() 
                && studyGroup.date.getMonth() === date.getMonth()
                && studyGroup.date.getYear() === date.getYear();
    });
}

function filterByNumOfParticipant(filteredStudyGroups, numOfParticipant) {
    const filterType = numOfParticipant.filterType;
    return filteredStudyGroups.filter( studyGroup => {
       if(filterType === 'lt') {
           return studyGroup.maxParticipants < numOfParticipant.num;
       } else if(filterType === 'gt') {
            return studyGroup.maxParticipants > numOfParticipant.num;
       } else {
            return studyGroup.maxParticipants === numOfParticipant.num;
       }
    });
}

  module.exports = router;

