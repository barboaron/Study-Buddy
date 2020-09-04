/* This file contains actions related to handle notifications */

const StudyGroup = require("./src/models/StudyGroup");
const User = require("./src/models/User");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const { io } = require("./server");
const Forum = require("./src/models/Forum");

const notificationTypes = {
    join: "join-request",
    accepted: "accepted",
    collaborationMsg: "collaboration-msg",
    postComment: "post-comment",
  };

function handleRequestJoinGroup(data) {
    const { id } = jwt_decode(data.jwt);
    User.findOne({ _id: id }).then((sender) => {
      User.findOne({ _id: data.group.creatorId }).then(async (receiver) => {
        let notification = {
          timeCreated: Date.now(),
          senderId: sender._id,
          senderName: sender.firstName + " " + sender.lastName,
          type: notificationTypes.join,
          group: data.group,
          answers: data.answers,
          questions: data.questions,
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
      })
      .catch(err => console.log('cant find receiver', err));
    })
    .catch(err => console.log('cant find sender', err));
}

function handleJoinGroupApproved(data) {
    const { id } = jwt_decode(data.jwt);
    User.findOne({ _id: id }).then((sender) => {
      User.findOne({ _id: data.approvedUserId }).then(async (receiver) => {
        let notification = {
          timeCreated: Date.now(),
          senderId: sender._id,
          senderName: sender.firstName + " " + sender.lastName,
          type: notificationTypes.accepted,
          group: {...data.group, isAdmin: false, didAnswerSurvey: false}
        };
        await User.updateOne(
          { _id: receiver._id },
          { unseenNotifications: receiver.unseenNotifications.concat(notification) }
        );
        if (receiver.socketId) {
          io.to(receiver.socketId).emit("notification", notification);
        }
        StudyGroup.findOne({ _id: data.group._id }).then(async (studyGroup) => {
          const participants = studyGroup.participants;
          const newParticipantName =
            receiver.firstName + " " + receiver.lastName;
          participants.push({
            name: newParticipantName,
            id: receiver._id.toString(),
            isCreator: false,
            didAnswerSurvey: false,
          });
          const isFull = participants.length === studyGroup.maxParticipants;
          const pendingUsers = isFull ? [] : studyGroup.pendingUsers.filter(userId => userId !== receiver._id.toString());
          const seenNotifications = isFull 
            ? removeFullGroupNotification(sender.seenNotifications, studyGroup._id.toString())
            : sender.seenNotifications.filter(notification => notification.timeCreated !== data.notificationId);
          const unseenNotifications = isFull 
            ? removeFullGroupNotification(sender.unseenNotifications, studyGroup._id.toString())
            : sender.unseenNotifications;
          await User.updateOne( { _id: sender._id }, { seenNotifications, unseenNotifications });
          await StudyGroup.updateOne({ _id: studyGroup._id }, { participants, isFull, pendingUsers });
        });
      });
    });
}

function handleJoinGroupIgnored(data) {
    const { id } = jwt_decode(data.jwt);
    User.findOne({ _id: id }).then((sender) => {
      User.findOne({ _id: data.ignoredUserId }).then(async (receiver) => {
        StudyGroup.findOne({ _id: data.group._id }).then(async (studyGroup) => {
          const pendingUsers = studyGroup.pendingUsers.filter(userId => userId !== receiver._id.toString());
          const seenNotifications = sender.seenNotifications.filter(notification => {
            return notification.group._id !== studyGroup._id.toString() 
              || notification.type !== notificationTypes.join
              || notification.senderId.toString() !== data.ignoredUserId;
          }); 
          await User.updateOne( { _id: sender._id }, { seenNotifications });
          await StudyGroup.updateOne({ _id: studyGroup._id }, { pendingUsers });
        });
      });
    });
}

function handleCollaborationMsg(data) {
    const { id } = jwt_decode(data.jwt);
        User.findOne({ _id: id }).then((sender) => {
            StudyGroup.findOne({ _id: data.group._id }).then(async (studyGroup) => {
              const recieverUsers = studyGroup.participants.filter(participant => participant.id !== id);
              let notification = {
                timeCreated: Date.now(),
                senderId: sender._id,
                senderName: sender.firstName + " " + sender.lastName,
                type: notificationTypes.collaborationMsg,
              };
               recieverUsers.forEach((recieverUser) => {
                sendGroupNotificationAndUpdateDB(recieverUser, notification, data.group)
              });
            });
        });
}

function handlePostComment(data) {
    const { id } = jwt_decode(data.jwt);
    User.findOne({ _id: id }).then((sender) => {
        Forum.findOne({ _id: data.forumId }).then(async (forum) => {
            let recieverUsers = new Set();
            const post = forum.posts.find(post => post._id === data.post._id);
            post.comments.forEach(comment => {
                if(comment.creatorId !== id) {
                    recieverUsers.add(comment.creatorId);
                }
            });
            if(data.post.creatorId !== id) {
                recieverUsers.add(data.post.creatorId);
            }
            let notification = {
                timeCreated: Date.now(),
                senderId: sender._id,
                senderName: sender.firstName + " " + sender.lastName,
                type: notificationTypes.postComment,
                post,
                forumId: data.forumId,
            };

            recieverUsers.forEach((recieverUserId) => {
                sendPostNotificationAndUpdateDB(recieverUserId, notification);
            });
        });
    });
}

function sendGroupNotificationAndUpdateDB(user, notification, studyGroup) {
    User.findOne({ _id: user.id }).then(async (receiver) => {
        let newNotification = {...notification, group: {...studyGroup, isAdmin: user.isCreator, didAnswerSurvey: user.didAnswerSurvey}};
        
        await User.updateOne(
          { _id: user.id },
          { unseenNotifications: receiver.unseenNotifications.concat(newNotification) }
        );
        if (receiver.socketId) {
          io.to(receiver.socketId).emit("notification", notification);
        }
    });
}
  
function sendPostNotificationAndUpdateDB(userId, notification) {
    User.findOne({ _id: userId }).then(async (receiver) => {        
        await User.updateOne(
          { _id: userId },
          { unseenNotifications: receiver.unseenNotifications.concat(notification) }
        );
        if (receiver.socketId) {
          io.to(receiver.socketId).emit("notification", notification);
        }
    });
}

function removeFullGroupNotification(notifications, groupId) {
    return notifications.filter( notification => {
        return notification.group._id !== groupId || notification.type !== notificationTypes.join;
    });
}


module.exports = { handlePostComment, handleCollaborationMsg, handleJoinGroupIgnored, handleJoinGroupApproved, handleRequestJoinGroup };