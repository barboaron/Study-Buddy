const Validator = require("validator");
const isEmpty = require("is-empty");

//Validate that post fields are not empty

const postTypes = ['question', 'help', 'discussion', 'solution', 'article'];

function validatePostInput(data) {
    let errors = {};

    data.content = !isEmpty(data.content) ? data.content : "";
    data.type = !isEmpty(data.type) ? data.type : "";
    data.title = !isEmpty(data.title) ? data.title : "";

    if (Validator.isEmpty(data.title)) {
        errors.title = "Title field is required";
    }
    if (Validator.isEmpty(data.content)) {
        errors.content = "Content field is required";
    }
    if (Validator.isEmpty(data.type)) {
        errors.type = "Type field is required";
    } else {
        if(!postTypes.includes(data.type)) {
            errors.type = "Invalid type";
        }
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};

function validateCommentInput(data) {
    let errors = {};

    data.comment = !isEmpty(data.comment) ? data.comment : "";

    if (Validator.isEmpty(data.comment)) {
        errors.comment = "Comment field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

module.exports = { validatePostInput, validateCommentInput, postTypes };

