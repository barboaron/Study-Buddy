const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const StudyGroupSchema = new Schema({
    participants: {
        type: [],
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        required: true
    },
    groupName: {
        type: String,
        required: true,
    },
    groupType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    maxParticipants: {
        type: Number, 
        required: true
    },
    questions: {
        type: [],
        required: false
    },
    date: {
        type: Date,
        required: false
    },
    isFull: {
        type: Boolean,
        required: true,
    },
    creatorName: {
        type: String,
        required: true,
    }
});

module.exports = StudyGroup = mongoose.model("studyGroups", StudyGroupSchema);