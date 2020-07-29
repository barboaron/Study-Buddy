const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ForumSchema = new Schema({
    forumName: {
        type: String,
        required: true
    },
    forumType: {
        type: String,
        required: true
    },
    universityName: {
        type: String,
        required: true,
    },
    courseName: {
        type: String,
        required: false,
    },
    courseId: {
        type: String,
        required: false,
    },
    posts: {
        type: [],
        required: true,
    }
});

module.exports = Forum = mongoose.model("forums", ForumSchema);