const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const User = require("../models/User");
const keys = require("../../config/keys");

function isLoggedIn(req, res, next) {
  
    const token = (req.body.jwt).substring(7);
  
    jwt.verify(token, keys.secretOrKey, function(err, decoded) {
        if (err) {
        res.status(401).json("please sign in");
        } else {
        next();
        }
    });
}

function isAdminUser(req, res, next) {
  
    const jwt = req.body.jwt;
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

module.exports = { isLoggedIn, isAdminUser, };
