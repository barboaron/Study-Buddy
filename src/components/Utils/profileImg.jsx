import React, { Component } from "react";
import axios from "axios";
import "../styles/userProfileStyle.css";

export default class ProfileImg extends Component {

  arrayBufferToBase64 = (buffer) => {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
};

createProfileImgSrc = (buffer) => {
  let base64Flag = 'data:image/*;base64,';
  let imageStr = this.arrayBufferToBase64(buffer);
  const imageSource = base64Flag + imageStr; 
  return imageSource;
}

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
          let base64Flag = 'data:image/*;base64,';
          let imageStr = this.arrayBufferToBase64(res.data.data.data);
          const imageSource = base64Flag + imageStr; //this is the image src you need to set!
          alert("Profile picture changed successfully!");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }



  render() {
    const { userDetails, hideChangePic } = this.props;
    const profilePicSrc = userDetails.img ? this.createProfileImgSrc(userDetails.img.data.data) : "defaultPicUser.png";
    return (
      <div className="profile-img">
        <img src={ profilePicSrc} alt="" />
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
