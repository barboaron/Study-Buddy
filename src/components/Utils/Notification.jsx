import React, { Component } from "react";
import { NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

/* A notification will appear to the user in the menu for on of the following reasons:
 * A join request sent to the creator's group.
 * My join request has been approved by the group's creator.
 * A user posted a new post in a group I am in.
 */
export default class Notification extends Component {
  getElementByType = () => {
    const { notification } = this.props;
    let message;
    switch (notification.type) {
      case "join-request":
        message = `${notification.senderName} asked to join your group ${notification.group.groupName}`;
        break;
      case "accepted":
        message = `${notification.senderName} has accepted your join request to ${notification.group.groupName} group`;
        break;
      case "collaboration-msg":
        message = `${notification.senderName} posted in ${notification.group.groupName} collaboration`;
        break;
      case "post-comment":
        message = `${notification.senderName} commented on ${notification.post.title} post`;
        break;
      default:
    }
    return message;
  };

  getItem = () => {
    const { notification, className, handleJoinPopup } = this.props;

    const message = this.getElementByType();
    if(notification.type === "join-request") {
      return (
        <NavDropdown.Item
          className={className}
          onClick={() => handleJoinPopup(notification)}
        >
          {message}
        </NavDropdown.Item>
      );
    } else if(notification.type === "post-comment") {
      return (
        <NavDropdown.Item className={className}>
          <Link
            to={{
              pathname: "/PostPage",
              state: {
                post: notification.post, 
                forumId: notification.forumId,
              },
            }}
          >
            {message}
          </Link>
        </NavDropdown.Item>
      )
    } else {
      return (
        <NavDropdown.Item className={className}>
          <Link
            to={{
              pathname: "/GroupPage",
              state: {
                groupId: notification.group._id,
              },
            }}
          >
            {message}
          </Link>
        </NavDropdown.Item>
      )
    }
  };

  render() {
    return (
      <>
        {this.getItem()}
        <NavDropdown.Divider />
      </>
    );
  }
}
