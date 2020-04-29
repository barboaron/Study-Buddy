import React, { Component } from "react";
import "../styles/userProfileStyle.css";

export default class ProfileImg extends Component {
  render() {
    const { userDetails, showChangePassword } = this.props;
    return (
      <div className="profile-img">
        <img src={userDetails.profilePic || "defaultPicUser.png"} alt="" />
        {!showChangePassword && (
          <div className="file btn btn-lg btn-primary">
            Change Photo
            <input type="file" name="file" />
          </div>
        )}
      </div>
    );
  }
}
