const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  universityName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  confirmed: {
    type: Boolean,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  socketId: {
    type: String,
    required: false
  },
  seenNotifications: {
    type:[],
    required: true
  },
  unseenNotifications: {
    type:[],
    required: true
  }
});
module.exports = User = mongoose.model("users", UserSchema);