import React, { Component } from "react";
import RegistrationForm from "./RegistrationForm";
import axios from "axios";

export default class RegistrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRegSucceed: undefined,
      isRegMailSent: false,
    };
  }

  signUpReq = (event) => {
    console.log("in signupreq");
    event.preventDefault();
    const firstName = event?.target?.elements?.firstName?.value;
    const lastName = event?.target?.elements?.lastName?.value;
    debugger;
    const university = event.target.elements.university.value; //bug here
    // const university = "MTA";
    const email = event?.target?.elements?.email?.value;
    const password = event?.target?.elements?.password?.value;
    const confirmPassword = event?.target?.elements?.confirmPassword?.value;

    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      universityName: university,
      password: password,
      password2: confirmPassword,
    };

    return axios
      .post("/api/users/register", userData)
      .then((res) => {
        if (!res.status === 200) {
          this.setState({ isRegSucceed: false });
        } else {
          this.setState({ isRegSucceed: true });
        }
      })
      .catch((err) => {
        this.setState({
          isRegSucceed: false,
          errMsg: Object.values(err.response.data),
        });
      });
  };

  render() {
    const { isRegSucceed, errMsg } = this.state;
    return (
      <div className="session">
        <div className="leftPicture"></div>
        {!isRegSucceed ? (
          <RegistrationForm
            signUpReq={this.signUpReq}
            isRegSucceed={isRegSucceed}
            errMsg={errMsg}
          ></RegistrationForm>
        ) : (
          <span className="loginLabel" onClick={this.onClickLogin}>
            A verification link has been sent to your email account Please click
            <br />
            on the verification link to confirm your account
          </span>
        )}
        <img
          className="signupLogo"
          src="LogoStudyBuddy.png"
          alt="Study-Buddy"
        />
      </div>
    );
  }
}
