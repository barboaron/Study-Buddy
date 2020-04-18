import React, { Component } from "react";
import FloatingLabel from "./floatingLabel";

export default class ChangeUserDetails extends Component {
  render() {
    const { showErrMsg, editProfile, userDetails, showChangePass } = this.props;
    return (
      <form className="form" onSubmit={editProfile}>
        <FloatingLabel
          placeholder={userDetails.degreeName || "Computer Science"}
          type="text"
          name="degree"
          content="Degree name:"
        />
        <FloatingLabel
          placeholder={userDetails.year || "2"}
          type="text"
          name="year"
          content="Year of study:"
        />
        {showErrMsg ? (
          <span className="errMsg">Error. Please try again</span>
        ) : null}
        <button className="changePassword" onClick={showChangePass}>
          Change Password
        </button>
        <button type="submit">Send</button>
      </form>
    );
  }
}
