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
const StudyGroup = require("./src/models/StudyGroup");
const keys = require("./config/keys");
const multer = require("multer");
const cors = require("cors");
const io = require("socket.io")(5500);

const groupTypes = {
  join: "join-request",
  accepted: "accepted",
};

io.on("connection", (socket) => {
  // socket.on('disconnect', async () => {
  //   await User.updateOne({socketId: socket.id}, {socketId:null});
  // });
  socket.on("new-user", async (data) => {
    if (data.jwt) {
      const { id } = jwt_decode(data.jwt);
      await User.updateOne({ _id: id }, { socketId: socket.id });
    }
  });
  socket.on("request-join-group", (data) => {
    const { id } = jwt_decode(data.jwt);
    User.findOne({ _id: id }).then((sender) => {
      User.findOne({ _id: data.group.creatorId }).then(async (receiver) => {
        let notification = {
          timeCreated: Date.now(),
          senderId: sender._id,
          senderName: sender.firstName + " " + sender.lastName,
          type: groupTypes.join,
          groupId: data.group._id,
          answers: data.answers,
        };
        await User.updateOne(
          { _id: receiver._id },
          { unseenNotifications: receiver.unseenNotifications.concat(notification) }
        );
        await StudyGroup.updateOne(
          { _id: data.group._id },
          { pendingUsers: data.group.pendingUsers.concat(id)}
        );

        if (receiver.socketId) {
          io.to(receiver.socketId).emit("notification", notification);
        }
      });
    });
  });
  socket.on("join-group-approved", (data) => {
    const { id } = jwt_decode(data.jwt);
    User.findOne({ _id: id }).then((sender) => {
      User.findOne({ _id: data.approvedUserId }).then(async (receiver) => {
        let notification = {
          timeCreated: Date.now(),
          senderId: sender._id,
          senderName: sender.firstName + " " + sender.lastName,
          type: groupTypes.accepted,
          groupId: data.groupId,
        };
        await User.updateOne(
          { _id: receiver._id },
          { unseenNotifications: receiver.unseenNotifications.concat(notification) }
        );
        if (receiver.socketId) {
          io.to(receiver.socketId).emit("notification", notification);
        }
        StudyGroup.findOne({ _id: data.groupId }).then(async (studyGroup) => {
          const participants = studyGroup.participants;
          const newParticipantName =
            receiver.firstName + " " + receiver.lastName;
          participants.push({
            name: newParticipantName,
            id: receiver._id,
            isCreator: false,
          });
          const isFull = participants.length === studyGroup.maxParticipants;
          const pendingUsers = isFull ? [] : studyGroup.pendingUsers;
          const seenNotifications = isFull 
            ? removeFullGroupNotification(sender.seenNotifications, studyGroup._id)
            : sender.seenNotifications;
          const unseenNotifications = isFull 
            ? removeFullGroupNotification(sender.unseenNotifications, studyGroup._id)
            : sender.unseenNotifications;
          await User.updateOne( { _id: sender._id }, { seenNotifications, unseenNotifications });
          await StudyGroup.updateOne({ _id: studyGroup._id }, { participants, isFull, pendingUsers });
        });
      });
    });
  });
});

function removeFullGroupNotification(notifications, groupId) {
  return notifications.filter( notification => {
    return notification.groupId !== groupId || notification.type !== groupTypes.join;
  });
}

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
// app.use(multer({ dest: './uploads/',
//   rename: function (fieldname, filename) {
//     return filename;
//   },
//  }).single("photo"));

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
