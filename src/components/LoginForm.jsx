import React, { Component } from "react";
import PropTypes from "prop-types";
// import ReactTooltip from 'react-tooltip';
import EmailIcon from "./Icons/EmailIcon";
import PasswordIcon from "./Icons/PasswordIcon";
import { Link } from "react-router-dom";
export default class LoginForm extends Component {
  static propTypes = {
    loginReq: PropTypes.func,
    showLoginFailErr: PropTypes.bool,
  };
  render() {
    debugger;
    const { loginReq, showLoginFailErr } = this.props;
    return (
      <form className="form" onSubmit={loginReq}>
        <h4>Sign In</h4>
        <p>
          Welcome back! Log in to your account to <span>Study-Buddy</span>
        </p>
        <div className="floating-label">
          <input placeholder="Email" type="email" name="email" />
          <label for="email">Email:</label>
          <div className="icon">
            <EmailIcon />
          </div>
        </div>
        <div className="floating-label">
          <input placeholder="Password" type="password" name="password" />
          <label for="password">Password:</label>
          <div className="icon">
            <PasswordIcon />
          </div>
        </div>
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
