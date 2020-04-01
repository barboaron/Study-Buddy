import React, { Component } from "react";
import PropTypes from "prop-types";
// import ReactTooltip from 'react-tooltip';
import EmailIcon from "./Icons/EmailIcon";
import PasswordIcon from "./Icons/PasswordIcon";

export default class LoginForm extends Component {
  static propTypes = {
    loginReq: PropTypes.func,
    showLoginFailErr: PropTypes.func,
    onClickSignUp: PropTypes.bool
  };
  render() {
    const { loginReq, showLoginFailErr, onClickSignUp } = this.props;
    return (
      <form onSubmit={loginReq}>
        <h4>Sign In</h4>
        <p>
          Welcome back! Log in to your account to <span>Study-Buddy</span>
        </p>
        <div class="floating-label">
          <input placeholder="Email" type="email" name="email" />
          <label for="email">Email:</label>
          <div class="icon">
            <EmailIcon />
          </div>
        </div>
        <div class="floating-label">
          <input placeholder="Password" type="password" name="password" />
          <label for="password">Password:</label>
          <div class="icon">
            <PasswordIcon />
          </div>
        </div>
        <button type="submit">Log in</button>
        {showLoginFailErr ? (
          <span>Login attempt fail. Please try again</span>
        ) : null}
        <span className="signupLabel" onClick={onClickSignUp}>
          Not a user? Sign up
        </span>
      </form>
    );
  }
}
