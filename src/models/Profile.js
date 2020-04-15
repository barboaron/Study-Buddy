const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = require("./User");
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
    year_of_study: {
        type: Number,
        required: true
    },
    pic_url: {
        type: String,
        required:false
    }
});
module.exports = Profile = mongoose.model("profiles", ProfileSchema);