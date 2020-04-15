import React, { Component } from "react";
import "./styles/userProfileStyle.css";
import PasswordIcon from "./Icons/PasswordIcon";
import axios from "axios";
// import setAuthToken from "../utils/setAuthToken";
// import jwt_decode from "jwt-decode";
import { Link } from "react-router-dom";

export default class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSucceedMsg: false,
    };
  }

  getUserDetails = () => {};

  changePassword = (event) => {
    event.preventDefault();
    const oldPassword = event?.target?.elements?.oldPassword?.value;
    const newPassword = event?.target?.elements?.newPassword?.value;
    const confirmPassword = event?.target?.elements?.confirmPassword?.value;
    const passwordData = {
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    };
    //const { history } = this.props;

    return axios
      .post("/api/changePassword", passwordData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          //sucesss
          this.setState({ showSucceedMsg: true });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  };

  render() {
    const { showSucceedMsg } = this.state;

    return (
      <div className="floating-label">
        {showSucceedMsg ? (
          <span>Password changed successfully!</span>
        ) : (
          <div>
            <div className="floating-label">
              <input
                placeholder="Old Password"
                type="password"
                name="oldPassword"
              />
              <label for="oldPassword">Old Password:</label>
              <div className="icon">
                <PasswordIcon />
              </div>
            </div>
            <div className="floating-label">
              <input
                placeholder="New Password"
                type="password"
                name="newPassword"
              />
              <label for="newPassword">New Password:</label>
              <div className="icon">
                <PasswordIcon />
              </div>
            </div>
            <div className="floating-label">
              <input
                placeholder="Confirm Password"
                type="password"
                name="confirmPassword"
              />
              <label for="confirmPassword">Confirm Password:</label>
              <div className="icon">
                <PasswordIcon />
              </div>
            </div>
            <button className="changePassword" onClick={this.changePassword}>
              Change Password
            </button>
          </div>
        )}
        <Link to="/UserProfile">
          <button className="changePassword" onClick={this.hideChangePassword}>
            Back
          </button>
        </Link>
      </div>
    );
  }
}
