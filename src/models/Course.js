const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const CourseSchema = new Schema({
    courseName: {
        type: String,
        required: true
    },
    degreeName: {
        type: String,
        required: true
    },
    universityName: {
        type: String,
        required: true
    },
});

module.exports = Course = mongoose.model("courses", CourseSchema);