import React, { Component } from "react";
import PropTypes from "prop-types";
// import ReactTooltip from 'react-tooltip';
import LoginForm from "./LoginForm";
import "./styles/formsStyle.scss";

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoginFailErr: false
    };
  }

  static propTypes = {};

  loginReq = event => {
    event.preventDefault();
    const email = event.target.elements.email.value;
    const password = event.target.elements.password.value;

    return fetch("login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(response => {
        if (!response.ok) {
          // throw response;
          //login fail
          this.setState({ showLoginFailErr: true });
        } else {
          this.setState({ showLoginFailErr: false });

          //login success- move to the main page
        }
      })
      .catch(err => {});
  };

  onClickSignUp = () => {};

  render() {
    const { showLoginFailErr } = this.state;
    return (
      <div>
        <img className="loginLogo" src="LogoStudyBuddy.png" alt="Study-Buddy" />
        <div className="session">
          <div className="leftPicture"></div>
          <LoginForm
            loginReq={this.loginReq}
            showLoginFailErr={showLoginFailErr}
            onClickSignUp={this.onClickSignUp}
          ></LoginForm>
          {/* <img src="LogoStudyBuddy.png" alt="Study-Buddy" /> */}
        </div>
      </div>
    );
  }
}
