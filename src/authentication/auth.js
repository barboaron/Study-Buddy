const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const User = require("../models/User");
const StudyGroup = require("../models/StudyGroup");
const keys = require("../../config/keys");

function isLoggedIn(req, res, next) {
  
    if(!req.body.jwt) {
        if(!req.headers['jwt'])
            res.status(401).json("please sign in");
    }
    
    const token = req.body.jwt ? (req.body.jwt).substring(7) : (req.headers['jwt']).substring(7);
  
    jwt.verify(token, keys.secretOrKey, function(err, decoded) {
        if (err) {
            res.status(401).json("please sign in");
        } else {
            next();
        }
    });
}

function isAdminUser(req, res, next) {
    const jwt = req.body.jwt ? req.body.jwt : req.headers['jwt'];
    const { id } = jwt_decode(jwt);

    User.findOne({ _id: id }).then(user => {
        if (!user) {
            return res.status(400).json("User does not exist.");
        } else {  
            if(!user.isAdmin) {
                return res.status(401).json("only admin user can access this page");
            } else {
                next();
            }
        }
    })
}

function isInGroup(req, res, next) {
    const jwt = req.body.jwt ? req.body.jwt : req.headers['jwt'];
    const groupId = req.body.groupId ? req.body.groupId : req.headers['groupId'];
    const { id } = jwt_decode(jwt);

    StudyGroup.findOne({ _id: groupId })
        .then((studyGroup) => {
            let isInGroup = false;
            studyGroup.participants.forEach((participant) => {
                if (participant.id.toString() === id) {
                    isInGroup = true;
                }
            });
            if(!isInGroup) {
                return res.status(401).json("only group members can access this page");
            }
            next();
        })
        .catch((err) => res.status(400).json("group does not exist"));
}

module.exports = { isLoggedIn, isAdminUser, isInGroup };
