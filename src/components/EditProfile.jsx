import React, { Component } from "react";
import "./styles/userProfileStyle.css";
import axios from "axios";
// import setAuthToken from "../utils/setAuthToken";
// import jwt_decode from "jwt-decode";
import ChangePassword from "./ChangePassword";

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
                <div class="profile-img">
                  <img
                    src={userDetails.profilePic || "defaultPicUser.png"}
                    alt=""
                  />
                  {!showChangePassword && (
                    <div class="file btn btn-lg btn-primary">
                      Change Photo
                      <input type="file" name="file" />
                    </div>
                  )}
                </div>
              </div>
              <div class="col-md-6">
                <div class="profile-head">
                  <h2>{userDetails.name || "Bar Boaron"}</h2>
                </div>
                {showChangePassword ? (
                  <ChangePassword />
                ) : (
                  <form className="form" onSubmit={this.editProfile}>
                    <div className="floating-label">
                      <input
                        placeholder={
                          userDetails.degreeName || "Computer Science"
                        }
                        type="text"
                        name="degree"
                      />
                      <label for="degree">Degree name:</label>
                    </div>
                    <div className="floating-label">
                      <input
                        placeholder={userDetails.year || "2"}
                        type="text"
                        name="year"
                      />
                      <label for="year">Year of study:</label>
                    </div>
                    {showErrMsg ? (
                      <span className="errMsg">Error. Please try again</span>
                    ) : null}
                    <button
                      className="changePassword"
                      onClick={this.showChangePass}
                    >
                      Change Password
                    </button>
                    <button type="submit">Send</button>
                  </form>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
