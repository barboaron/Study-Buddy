const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    courses: {
        type: [],
        required:true
    },
    degree_name: {
        type: String,
        required:true
    },
    university_name: {
        type: String,
        required: true
    },
    year_of_study: {
        type: Number,
        required: true
    },
    img: {
        data: Buffer,
        contentType: String,
        required:false
    },
    study_groups: {
        type: [],
        required:false
    }
});
module.exports = Profile = mongoose.model("profiles", ProfileSchema);