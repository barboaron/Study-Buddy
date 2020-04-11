import React, { Component } from "react";
import PropTypes from "prop-types";
// import ReactTooltip from 'react-tooltip';
import LoginForm from "./LoginForm";
import "./styles/formsStyle.scss";
import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoginFailErr: false,
    };
  }

  static propTypes = {};

  loginReq = (event) => {
    event.preventDefault();
    const email = event.target.elements.email.value;
    const password = event.target.elements.password.value;
    const userData = { email: email, password: password };
    const { history } = this.props;

    return axios
      .post("/api/users/login", userData)
      .then((res) => {
        if (!res.status === 200) {
          // throw response;
          //login fail
          this.setState({ showLoginFailErr: true });
        } else {
          this.setState({ showLoginFailErr: false });
          const { token } = res.data;
          localStorage.setItem("jwtToken", token);
          //Set token to Auth header
          setAuthToken(token);
          //Decode token to get user data
          const decoded = jwt_decode(token);
          console.log(decoded);
          history.push("/");
        }
      })
      .catch((err) => {});
  };

  //   fetch("api/users/login", {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({ email: email, password: password })
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         // throw response;
  //         //login fail
  //         this.setState({ showLoginFailErr: true });
  //       } else {
  //         this.setState({ showLoginFailErr: false });

  //         response.json().then(data => {
  //           localStorage.setItem("jwtToken", data.token);
  //         }) //need catch?
  //         //login success- move to the main page
  //       }
  //     })
  //     .catch(err => {});
  // };

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
          ></LoginForm>
          {/* <img src="LogoStudyBuddy.png" alt="Study-Buddy" /> */}
        </div>
      </div>
    );
  }
}
