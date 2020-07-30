import React, { Component } from "react";
import LoginForm from "./LoginForm";
import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import { isUserLoggedIn } from "../Utils/isUserLoggedIn";
import jwt_decode from "jwt-decode";
import "../styles/formsStyle.scss";

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoginFailErr: false,
    };
  }
  componentDidMount() {
    const { history } = this.props;
    isUserLoggedIn(history, "/");
  }

  loginReq = (event) => {
    event.preventDefault();
    const email = event?.target?.elements?.email?.value;
    const password = event?.target?.elements?.password?.value;
    const userData = { email: email, password: password };
    const { history } = this.props;

    return axios
      .post("/api/users/login", userData)
      .then((res) => {
        if (res.status !== 200) {
          //login fail
          this.setState({ showLoginFailErr: true });
        } else {
          this.setState({ showLoginFailErr: false });
          const { token } = res.data;
          localStorage.setItem("jwtToken", token);
          //Set token to Auth header
          setAuthToken(token);
          //Decode token to get user id
          const { id } = jwt_decode(token);
          localStorage.setItem("loggedInUserID", id);
          history.push("/");
        }
      })
      .catch((err) => {
        this.setState({ showLoginFailErr: true });
      });
  };

  render() {
    const { showLoginFailErr } = this.state;
    return (
      <div className="registrationAndLogin_page">
        <img className="loginLogo" src="LogoStudyBuddy.png" alt="Study-Buddy" />
        <div className="session">
          <div className="leftPicture"></div>
          <LoginForm
            loginReq={this.loginReq}
            showLoginFailErr={showLoginFailErr}
          ></LoginForm>
        </div>
      </div>
    );
  }
}
