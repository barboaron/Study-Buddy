import React, { Component } from "react";
import { NavDropdown } from "react-bootstrap";

export default class Notification extends Component {
  getElementByType = () => {
    const { notification } = this.props;
    let message;
    switch (notification.type) {
      case "join-request":
        message = `${notification.senderName} asked to join your group "${notification.group.groupName}"`;
        break;
      case "accepted":
        message = `${notification.senderName} has accepted your join request to "${notification.group.groupName}" group`;
        break;
      case "posted":
      default:
        message = `${notification.senderName} posted in groupName collaboration`;
    }
    return message;
  };

  render() {
    const { notification, className, handleJoinPopup } = this.props;

    const message = this.getElementByType();
    return (
      <>
        <NavDropdown.Item
          className={className}
          href={notification.type !== "join-request" ? "#action/3.1" : null}
          onClick={
            notification.type === "join-request" &&
            (() => handleJoinPopup(notification))
          }
        >
          {message}
        </NavDropdown.Item>
        <NavDropdown.Divider />
      </>
    );
  }
}
