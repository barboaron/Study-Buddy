import React, { Component } from "react";
import "../styles/userProfileStyle.css";
import PasswordIcon from "../Icons/PasswordIcon";
import FloatingLabel from "./floatingLabel";
import axios from "axios";

/* ChangePassword component is a util component for EditProfile- enables the user to change his password*/
export default class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSucceedMsg: false,
    };
    this.changePassword = this.changePassword.bind(this);
  }

  async changePassword(event) {
    event.preventDefault();
    const currentPassword = event?.target?.elements?.oldPassword?.value;
    const newPassword = event?.target?.elements?.newPassword?.value;
    const confirmPassword = event?.target?.elements?.confirmPassword?.value;

    let token = await localStorage.getItem("jwtToken");

    const passwordData = {
      currentPassword,
      newPassword,
      confirmPassword,
      jwt: token,
    };

    return axios
      .post("/api/users/changePassword", passwordData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.setState({ showSucceedMsg: true });
        }
      })
      .catch((err) => {
        this.setState({ errMsg: Object.values(err.response.data) });
      });
  }

  render() {
    const { showSucceedMsg, errMsg } = this.state;
    const { toggleEditProfile } = this.props;

    return (
      <div className="floating-label">
        {showSucceedMsg ? (
          <span className="msgSuccess">
            Password changed successfully!
            <br />
          </span>
        ) : (
          <form className="form" onSubmit={this.changePassword}>
            {errMsg ? (
              <span className="errMsg">
                {errMsg.map((elem) => (
                  <span className="errMsg">
                    {elem} <br />
                  </span>
                ))}
              </span>
            ) : null}
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
        <button className="BackBtn" onClick={() => toggleEditProfile()}>
          Back
        </button>
      </div>
    );
  }
}
