import React, { Component } from "react";
import "../styles/userProfileStyle.css";
import PasswordIcon from "../Icons/PasswordIcon";
import FloatingLabel from "./floatingLabel";
import axios from "axios";
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
    const passwordData = {
      currentPassword: event?.target?.elements?.oldPassword?.value,
      newPassword: event?.target?.elements?.newPassword?.value,
      confirmPassword: event?.target?.elements?.confirmPassword?.value,
    };
    debugger;
    return axios
      .post("/api/users/changePassword", passwordData)
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
          <form className="form" onSubmit={this.changePassword}>
            <FloatingLabel
              placeholder="Old Password"
              type="password"
              name="oldPassword"
              content="Old Password:"
              Icon={PasswordIcon}
            />
            <FloatingLabel
              placeholder="New Password"
              type="password"
              name="newPassword"
              content="New Password:"
              Icon={PasswordIcon}
            />
            <FloatingLabel
              placeholder="Confirm Password"
              type="password"
              name="confirmPassword"
              content="Confirm Password:"
              Icon={PasswordIcon}
            />
            <button className="changePassword" type="submit">
              Change Password
            </button>
          </form>
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
