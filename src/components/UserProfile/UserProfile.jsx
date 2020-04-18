import React, { Component } from "react";
import "../styles/userProfileStyle.css";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Link } from "react-router-dom";

export default class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currTab: 0,
      list: this.getMyGroup(),
    };
  }

  handleChange = (_, newValue) => {
    let list = [];
    switch (newValue) {
      case 0:
        list = this.getMyGroup();
        break;
      case 1:
        list = this.getMyCourses();
        break;
      default:
        break;
    }
    this.setState({ currTab: newValue, list });
  };

  getMyGroup = () => {
    debugger;
    return ["groups", "bla"];
  };
  getMyCourses = () => {
    debugger;
    return ["courses", "bla"];
  };
  getUserDetails = () => {};

  render() {
    const userDetails = this.getUserDetails() || {};
    const { list } = this.state;
    return (
      <div className="profile_user">
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />

        <div class="container emp-profile">
          <form method="post">
            <div class="row">
              <div class="col-md-4">
                <div class="profile-img">
                  <img
                    src={userDetails.profilePic || "defaultPicUser.png"}
                    alt=""
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="profile-head">
                  <h2>{userDetails.name || "Bar Boaron"}</h2>
                  <h5>
                    Degree name: {userDetails.degreeName || "Computer Science"}{" "}
                    <br /> University name: {userDetails.university || "MTA"}
                    <br /> Year of study: {userDetails.year || "2"}
                  </h5>
                  <Paper square>
                    <Tabs
                      value={this.state.currTab}
                      onChange={this.handleChange}
                      variant="fullWidth"
                      indicatorColor="primary"
                      textColor="primary"
                    >
                      <Tab label="My Groups" />
                      <Tab label="My Courses" />
                    </Tabs>
                  </Paper>
                  <div>{list}</div>
                </div>
              </div>
              {userDetails.edit || true ? (
                <Link to="/EditProfile">
                  <div class="col-md-2">Edit Profile</div>
                </Link>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    );
  }
}
