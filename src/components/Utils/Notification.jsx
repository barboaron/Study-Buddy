import React, { Component } from "react";

export default class Notification extends Component {
  getElementByType = () => {
    const { notification } = this.props;
    let message;
    switch (notification.type) {
      case "join-request":
        message = `${notification.senderName} asked to join your group`;
        break;
      case "accepted":
        message = `${notification.senderName} has accepted your join request to groupName group`;
        break;
      case "posted":
      default:
        message = `${notification.senderName} posted in groupName collaboration`;
    }
    return message;
  };

  render() {
    const message = this.getElementByType();
    return message;
  }
}
