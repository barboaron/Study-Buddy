import React, { Component } from "react";
import FloatingLabel from "./floatingLabel";
import axios from "axios";

export default class ChangeUserDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSucceedMsg: false,
    };
    this.editProfile = this.editProfile.bind(this);
  }

  async editProfile(event) {
    event.preventDefault();

    const degreeName = event?.target?.elements?.degreeName?.value;
    const year = event?.target?.elements?.year?.value;
    let token = await localStorage.getItem("jwtToken");
    debugger;
    const profileData = {
      jwt: token,
      degree_name: degreeName,
      year_of_study: year,
    };

    return axios
      .post("/api/profiles/updateProfile", profileData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.setState({ showSucceedMsg: true, detailsUpdated: res.data });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  render() {
    const {
      showErrMsg,
      userDetails,
      showChangePass,
      toggleEditProfile,
    } = this.props;
    const { showSucceedMsg, detailsUpdated } = this.state;

    return (
      <div className="floating-label">
        {showSucceedMsg ? (
          <span className="msgPasswodSuccess">
            Details updated successfully!
            <br />
          </span>
        ) : (
          <form className="form" onSubmit={this.editProfile}>
            <FloatingLabel
              placeholder={userDetails.degree_name}
              type="text"
              name="degreeName"
              content="Degree name:"
              defaultValue={userDetails.degree_name}
            />
            <FloatingLabel
              placeholder={userDetails.year_of_study}
              type="text"
              name="year"
              content="Year of study:"
              defaultValue={userDetails.year_of_study}
            />
            {showErrMsg ? (
              <span className="errMsg">Error. Please try again</span>
            ) : null}
            <button className="changePassword" onClick={showChangePass}>
              Change Password
            </button>
            <button type="submit">Send</button>
          </form>
        )}
        <button
          className="BackBtn"
          onClick={() => toggleEditProfile(detailsUpdated)}
        >
          Back
        </button>
      </div>
    );
  }
}
