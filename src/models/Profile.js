const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    courses: {
        type: [],
        required:false
    },
    degree_name: {
        type: String,
        required:false
    },
    university_name: {
        type: String,
        required: true
    },
    year_of_study: {
        type: Number,
        required: false
    },
    img: {
        data: Buffer,
        contentType: String,
        required:false
    },
    imgSrc: {
        type: String,
        required:false
    },
    study_groups: {
        type: [],
        required:false
    },
    isFullDetails: {
        type: Boolean,
        required:true
    }
});
module.exports = Profile = mongoose.model("profiles", ProfileSchema);