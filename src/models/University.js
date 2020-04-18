const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UniversitySchema = new Schema({
    universityName: {
        type: String,
        required: true
    },
    universityDegrees: {
        type: [],
        required: true
    },
});

module.exports = University = mongoose.model("universities", UniversitySchema);