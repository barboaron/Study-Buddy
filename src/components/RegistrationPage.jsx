import React, { Component } from "react";
// import PropTypes from "prop-types";
// import ReactTooltip from 'react-tooltip';
import RegistrationForm from "./RegistrationForm";
// import "./formsStyle.scss";
import axios from "axios";

export default class RegistrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRegSucceed: undefined,
      isRegMailSent: false
    };
  }

  static propTypes = {};

  signUpReq = event => {
    console.log("in signupreq");
    event.preventDefault();
    const firstName = event.target.elements.firstName.value;
    const lastName = event.target.elements.lastName.value;
    //const university = event.target.elements.university.value;//bug here
    const university = "MTA";
    const email = event.target.elements.email.value;
    const password = event.target.elements.password.value;
    const confirmPassword = event.target.elements.confirmPassword.value;

    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      universityName: university,
      password: password,
      //confirmpassword: confirmPassword
      password2: confirmPassword
    };

    return axios
    .post("/api/users/register", userData)
    .then(res => {
      if (!res.status === 200) {
        // throw response;
        //signUp fail
        this.setState({ isRegSucceed: false });
      } else {
        this.setState({ isRegSucceed: true });
        //signUp success- move to the main page
      }
    })
    .catch(err => {}
    );
};
 
  //   fetch("api/users/register", {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       firstName: firstName,
  //       lastName: lastName,
  //       email: email,
  //       universityName: university,
  //       password: password,
  //       //confirmpassword: confirmPassword
  //       password2: confirmPassword
  //     })
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         // throw response;
  //         //signUp fail
  //         this.setState({ isRegSucceed: false });
  //       } else {
  //         this.setState({ isRegSucceed: true });
  //         //signUp success- move to the main page
  //       }
  //     })
  //     .catch(err => {});
  // };

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
