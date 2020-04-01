import React, { Component } from "react";
// import PropTypes from "prop-types";
// import ReactTooltip from 'react-tooltip';
import RegistrationForm from "./RegistrationForm";
// import "./formsStyle.scss";

export default class RegistrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRegSucceed: undefined,
      isRegMailSent: false
    };
  }

  static propTypes = {};

  SignUpReq = event => {
    event.preventDefault();
    const firstName = event.target.elements.firstName.value;
    const lastName = event.target.elements.lastName.value;
    const university = event.target.elements.university.value;
    const email = event.target.elements.email.value;
    const password = event.target.elements.password.value;
    const confirmPassword = event.target.elements.confirmPassword.value;

    return fetch("signUp", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstname: firstName,
        lastname: lastName,
        email: email,
        university: university,
        password: password,
        confirmpassword: confirmPassword
      })
    })
      .then(response => {
        if (!response.ok) {
          // throw response;
          //signUp fail
          this.setState({ isRegSucceed: false });
        } else {
          this.setState({ isRegSucceed: true });
          //signUp success- move to the main page
        }
      })
      .catch(err => {});
  };

  onClickLogin = () => {};

  render() {
    const { isRegSucceed } = this.state;
    return (
      <div className="session">
        <div className="leftPicture"></div>
        {!isRegSucceed ? (
          <RegistrationForm
            signUpReq={this.signUpReq}
            isRegSucceed={isRegSucceed}
            onClickLogin={this.onClickLogin}
          ></RegistrationForm>
        ) : (
          <span className="loginLabel" onclick={this.onClickLogin}>
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
