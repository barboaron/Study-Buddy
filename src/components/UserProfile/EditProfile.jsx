import React, { Component } from "react";
import "../styles/userProfileStyle.css";
import axios from "axios";
import ChangePassword from "../Utils/ChangePassword";
import ChangeUserDetails from "../Utils/ChangeUserDetails";
import ProfileImg from "../Utils/profileImg";

export default class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getUserDetails = () => {};
  showChangePass = () => {
    this.setState({ showChangePassword: true });
  };
  editProfile = (event) => {
    event.preventDefault();
    const firstName = event?.target?.elements?.firstName?.value;
    const lastName = event?.target?.elements?.lastName?.value;
    const degreeName = event?.target?.elements?.degreeName?.value;
    const year = event?.target?.elements?.year?.value;
    //const courses = event.target.elements.courses.value;
    const profileData = {
      firatName: firstName,
      lastName: lastName,
      degreeName: degreeName,
      year: year,
    };
    const { history } = this.props;

    return axios
      .post("/api/changeProfile", profileData)
      .then((res) => {
        if (res.status !== 200) {
          this.setState({ showErrMsg: true });

          console.log("error");
        } else {
          history.push("/userProfile");
        }
      })
      .catch((err) => {
        console.log("error");
        this.setState({ showErrMsg: true });
      });
  };

  render() {
    const { showChangePassword, showErrMsg } = this.state;
    const userDetails = this.getUserDetails() || {};
    return (
      <div className="profile_user">
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div class="container emp-profile">
          <form method="post">
            <div class="row">
              <div class="col-md-4">
                <ProfileImg
                  userDetails={userDetails}
                  showChangePassword={showChangePassword}
                />
              </div>
              <div class="col-md-6">
                <div class="profile-head">
                  <h2>{userDetails.name || "Bar Boaron"}</h2>
                </div>
                {showChangePassword ? (
                  <ChangePassword />
                ) : (
                  <ChangeUserDetails
                    userDetails={userDetails}
                    showErrMsg={showErrMsg}
                    editProfile={this.editProfile}
                    showChangePass={this.showChangePass}
                  />
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
