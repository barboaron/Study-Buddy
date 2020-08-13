import React, { Component } from "react";
import { NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

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
      case "posted":
      default:
        message = `${notification.senderName} posted in ${notification.group.groupName} collaboration`;
    }
    return message;
  };

  getItem = () => {
    const { notification, className, handleJoinPopup } = this.props;

    const message = this.getElementByType();
    return notification.type !== "join-request" ? (
      <NavDropdown.Item className={className}>
        <Link
          to={{ pathname: "/GroupPage", state: { group: notification.group } }}
        >
          {message}
        </Link>
      </NavDropdown.Item>
    ) : (
      <NavDropdown.Item
        className={className}
        onClick={() => handleJoinPopup(notification)}
      >
        {message}
      </NavDropdown.Item>
    );
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
