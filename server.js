const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./src/routes/api/users");
const profiles = require("./src/routes/api/profiles");
const courses = require("./src/routes/api/courses");
const admins = require("./src/routes/api/admins");
const studyGroups = require("./src/routes/api/studyGroups");
const forums = require("./src/routes/api/forums");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const User = require("./src/models/User");
const keys = require("./config/keys");
const multer = require("multer");
const cors = require("cors");
const io = require("socket.io")(5500);
module.exports = { io };
const { handlePostComment, handleCollaborationMsg, handleJoinGroupIgnored, handleJoinGroupApproved, handleRequestJoinGroup } = require("./socket");

io.on("connection", (socket) => {
  socket.on("new-user", async (data) => {
    if (data.jwt) {
      const { id } = jwt_decode(data.jwt);
      await User.updateOne({ _id: id }, { socketId: socket.id });
    }
  });
  socket.on("request-join-group", (data) => {
      handleRequestJoinGroup(data);
  });
  socket.on("join-group-approved", (data) => {
      handleJoinGroupApproved(data);
  });
  socket.on("join-group-ignored", (data) => {
      handleJoinGroupIgnored(data);
  });
  socket.on("collaboration-msg", (data) => {
      handleCollaborationMsg(data);
  });
  socket.on("post-comment", (data) => {
    handlePostComment(data);
  });
});

const app = express();
// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: false })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));



// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);
app.use("/api/profiles", profiles);
app.use("/api/courses", courses);
app.use("/api/admins", admins);
app.use("/api/studyGroups", studyGroups);
app.use("/api/forums", forums);

app.use(cors());

app.get("/confirmation/:token", async (req, res) => {
  try {
    const user = jwt_decode(req.params.token);
    const id = user.id;
    await User.update({ _id: id }, { confirmed: true });
  } catch (err) {
    console.log(err);
  }
  return res.redirect("http://localhost:3000");
});


const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));


