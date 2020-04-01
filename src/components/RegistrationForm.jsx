import React, { Component } from "react";
import PropTypes from "prop-types";
// import ReactTooltip from 'react-tooltip';
import EmailIcon from "./Icons/EmailIcon";
import PasswordIcon from "./Icons/PasswordIcon";
import UniversityOptions from "./UniversityOptions";
// import "./formsStyle.scss";

export default class RegistrationForm extends Component {
  static propTypes = {
    signUpReq: PropTypes.func,
    onClickLogin: PropTypes.func,
    isRegSucceed: PropTypes.bool
  };

  render() {
    const { signUpReq, isRegSucceed, onClickLogin } = this.props;
    return (
      <form onSubmit={signUpReq}>
        <h4>Sign Up</h4>
        <p>
          Welcome! Nice to meet you, Sign up to <span>Study-Buddy</span>
        </p>

        <div class="floating-label">
          <input placeholder="First Name" type="text" name="firstName" />
          <label for="first name">First Name:</label>
        </div>
        <div class="floating-label">
          <input placeholder="Last Name" type="text" name="lastName" />
          <label for="last name">Last Name:</label>
        </div>
        <UniversityOptions />
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
        <div class="floating-label">
          <input
            placeholder="Confirm Password"
            type="password"
            name="confirmPassword"
          />
          <label for="confirm password">Confirm Password:</label>
          <div class="icon">
            <PasswordIcon />
          </div>
        </div>

        <button type="submit">Send</button>
        {isRegSucceed === false ? (
          <span>Registration attempt fail. Please try again</span>
        ) : null}

        <span className="loginLabel" onclick={onClickLogin}>
          Already have an account? Sign in
        </span>
      </form>
    );
  }
}
