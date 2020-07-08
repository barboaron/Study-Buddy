import React, { Component } from "react";
import axios from "axios";
import "../styles/userProfileStyle.css";

export default class ProfileImg extends Component {
  changeProfilePic = async (event) => {
    //need to check
    event.persist();
    event.preventDefault();

    const file = event.target.files[0];
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
          const imageSource = res.data;
          this.props.updateProfilePic(imageSource);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const { userDetails, hideChangePic } = this.props;

    return (
      <div className="profile-img">
        <img src={userDetails.imgSrc} alt="" />
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
