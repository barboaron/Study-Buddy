import React, { Component } from "react";
import PropTypes from "prop-types";
import EmailIcon from "../Icons/EmailIcon";
import PasswordIcon from "../Icons/PasswordIcon";
import DropDownOptions from "../Utils/DropDownOptions";
import FloatingLabel from "../Utils/floatingLabel";
import { Link } from "react-router-dom";
import axios from "axios";

export default class RegistrationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.getAllUniversities = this.getAllUniversities.bind(this);
  }

  static propTypes = {
    signUpReq: PropTypes.func,
    onClickLogin: PropTypes.func,
    isRegSucceed: PropTypes.bool,
  };

  async componentDidMount() {
    const universities = await this.getAllUniversities();
    this.setState({ universities, isLoading: true });
  }

  async getAllUniversities() {
    return await axios
      .get("/api/users/allUniversities")
      .then((res) => {
        console.log("then");
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  render() {
    const { signUpReq, isRegSucceed, errMsg } = this.props;
    const { isLoading, universities } = this.state;
    if (!isLoading) {
      return null;
    }
    return (
      <form className="form" onSubmit={signUpReq}>
        <h4>Sign Up</h4>
        <p>
          Welcome! Nice to meet you, Sign up to <span>Study-Buddy</span>
        </p>
        <FloatingLabel
          placeholder="First Name"
          type="text"
          name="firstName"
          content="First Name:"
        />
        <FloatingLabel
          placeholder="Last Name"
          type="text"
          name="lastName"
          content="Last Name:"
        />
        <DropDownOptions options={universities} label_name="Univesity Name:" />
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
        <FloatingLabel
          placeholder="Confirm Password"
          type="password"
          name="confirmPassword"
          content="Confirm Password:"
          Icon={PasswordIcon}
        />
        <button type="submit">Send</button>
        {isRegSucceed === false ? (
          <span className="errMsg">
            {errMsg.map((elem) => (
              <span className="errMsg">
                {elem} <br />
              </span>
            ))}
          </span>
        ) : null}
        <Link to="/login">
          <span className="loginLabel">Already have an account? Sign in</span>
        </Link>
      </form>
    );
  }
}
