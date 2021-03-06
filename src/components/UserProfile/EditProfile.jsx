import React, { Component } from "react";
import ChangePassword from "../Utils/ChangePassword";
import ChangeUserDetails from "../Utils/ChangeUserDetails";
import ProfileImg from "../Utils/profileImg";
import { Header } from "../Header";
import "../styles/userProfileStyle.css";

/* EditProfile component is a util component for UserProfile- enables a user to edit his profile details*/
export default class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  showChangePass = () => {
    this.setState({ showChangePassword: true });
  };

  render() {
    const { showChangePassword, showErrMsg } = this.state;
    const {
      userDetails,
      fullName,
      toggleEditProfile,
      updateProfilePic,
    } = this.props;

    return (
      <div className="profile_user">
        <Header />
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile">
          <div className="row">
            <div className="col-md-4">
              <ProfileImg
                userDetails={userDetails}
                hideChangePic={showChangePassword}
                updateProfilePic={updateProfilePic}
              />
            </div>
            <div className="col-md-6">
              <div className="profile-head">
                <h2>{fullName}</h2>
              </div>
              {showChangePassword ? (
                <ChangePassword toggleEditProfile={toggleEditProfile} />
              ) : (
                <ChangeUserDetails
                  userDetails={userDetails}
                  showErrMsg={showErrMsg}
                  showChangePass={this.showChangePass}
                  toggleEditProfile={toggleEditProfile}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
