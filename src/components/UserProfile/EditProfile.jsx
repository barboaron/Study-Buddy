import React, { Component } from "react";
import axios from "axios";
import ChangePassword from "../Utils/ChangePassword";
import ChangeUserDetails from "../Utils/ChangeUserDetails";
import ProfileImg from "../Utils/profileImg";
import { isUserLoggedIn } from "../Utils/isUserLoggedIn";
import "../styles/userProfileStyle.css";

export default class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    isUserLoggedIn(history, "/EditProfile", "/login");
    // debugger;
    const { userDetails, fullName } = this.props.location.state;
    this.setState({ userDetails, fullName, isLoading: true });
  }

  async getUserDetails(user_id) {
    const token = await localStorage.getItem("jwtToken");

    const reqData = {
      jwt: token,
      userId: user_id,
    };
    debugger;

    return axios
      .post("/api/profiles/profile", reqData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          debugger;
          return res;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }
  createFullName = (userDetails) => {
    const { firstName, lastName } = userDetails;
    return (
      firstName[0].toUpperCase() +
      firstName.substring(1) +
      " " +
      lastName[0].toUpperCase() +
      lastName.substring(1)
    );
  };

  showChangePass = () => {
    this.setState({ showChangePassword: true });
  };

  render() {
    const {
      showChangePassword,
      showErrMsg,
      userDetails,
      fullName,
      isLoading,
    } = this.state;
    // debugger;

    if (!isLoading) {
      return null;
    }
    // debugger;
    return (
      <div className="profile_user">
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile">
          <div className="row">
            <div className="col-md-4">
              <ProfileImg
                userDetails={userDetails}
                showChangePassword={showChangePassword}
              />
            </div>
            <div className="col-md-6">
              <div className="profile-head">
                <h2>{fullName}</h2>
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
        </div>
      </div>
    );
  }
}
