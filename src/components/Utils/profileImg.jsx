import React, { Component } from "react";
import axios from "axios";
import "../styles/userProfileStyle.css";

export default class ProfileImg extends Component {
  async changeProfilePic(event) {
    //need to check
    event.persist();
    event.preventDefault();

    const file = event?.target?.elements[1].files[0];
    console.log(file);
    const data = new FormData();
    data.append("file", file);
    let token = await localStorage.getItem("jwtToken");

    return axios
      .post("/api/profiles/changeProfilePic", data, {
        headers: {
          jwt: `${token}`,
        },
      })
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          alert("Profile picture changed successfully!");
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  render() {
    const { userDetails, hideChangePic } = this.props;
    return (
      <div className="profile-img">
        <img src={userDetails?.profilePic || "defaultPicUser.png"} alt="" />
        {!hideChangePic && (
          <div className="file btn btn-lg btn-primary">
            Change Photo
            <input
              className="input"
              type="file"
              name="file"
              accept="image/*"
              onChange={this.changeProfilePic}
            />
          </div>
        )}
      </div>
    );
  }
}
