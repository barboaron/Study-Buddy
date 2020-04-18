import React, { Component } from "react";
import PropTypes from "prop-types";
import EmailIcon from "../Icons/EmailIcon";
import PasswordIcon from "../Icons/PasswordIcon";
import FloatingLabel from "../Utils/floatingLabel";
import { Link } from "react-router-dom";

export default class LoginForm extends Component {
  static propTypes = {
    loginReq: PropTypes.func,
    showLoginFailErr: PropTypes.bool,
  };

  render() {
    const { loginReq, showLoginFailErr } = this.props;
    return (
      <form className="form" onSubmit={loginReq}>
        <h4>Sign In</h4>
        <p>
          Welcome back! Log in to your account to <span>Study-Buddy</span>
        </p>
        <FloatingLabel
          placeholder="Email"
          type="email"
          name="email"
          content="Email:"
          Icon={EmailIcon}
        />
        <FloatingLabel
          placeholder="Password"
          type="password"
          name="password"
          content="Password:"
          Icon={PasswordIcon}
        />
        <button type="submit">Log in</button>
        {showLoginFailErr ? (
          <span className="errMsg">Login attempt fail. Please try again</span>
        ) : null}
        <Link to="/registration">
          <span className="signupLabel">Not a user? Sign up</span>
        </Link>
      </form>
    );
  }
}
