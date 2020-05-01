import React, { Component } from "react";
import "../styles/userProfileStyle.css";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Link } from "react-router-dom";
import axios from "axios";
import { isUserLoggedIn } from "../Utils/isUserLoggedIn";

export default class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currTab: 0,
      isLoading: false,
    };
    this.getUserID = this.getUserID.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
  }

  async componentDidMount() {
    const { history } = this.props;
    isUserLoggedIn(history, "/UserProfile", "/login");

    debugger;
    const user_id = await this.getUserID();
    const user_details = await this.getUserDetails(user_id);
    this.setState({ user_id, userDetails: user_details.data, isLoading: true });
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
    const { study_groups } = this.state?.userDetails;
    return study_groups.length !== 0 ? study_groups : ["No Groups"];
  };

  getMyCourses = () => {
    const { courses } = this.state?.userDetails;
    return courses.length !== 0 ? courses : ["No Courses"];
  };

  async getUserID() {
    // will move to parent
    let token = await localStorage.getItem("jwtToken");
    const reqData = {
      jwt: token,
    };

    return axios
      .post("/api/users/getUserId", reqData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data.id;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async getUserDetails(user_id) {
    const token = await localStorage.getItem("jwtToken");

    const reqData = {
      jwt: token,
      userId: user_id,
    };
    debugger;

    return axios
      .post("/api/profiles/profile", reqData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          debugger;
          return res;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async getAllPossibleCourses() {
    let token = await localStorage.getItem("jwtToken");

    const reqData = {
      jwt: token,
    };
    debugger;
    return axios
      .post("/api/courses/", reqData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data.courses;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }
  createFullName = (userDetails) => {
    const { firstName, lastName } = userDetails;
    return (
      firstName[0].toUpperCase() +
      firstName.substring(1) +
      " " +
      lastName[0].toUpperCase() +
      lastName.substring(1)
    );
  };
  toggleEditProfile = () => {
    const { isEditProfile } = this.state;
    this.setState({ isEditProfile: !isEditProfile });
  };

  render() {
    const { list, userDetails, isLoading, currTab } = this.state;
    if (!isLoading) {
      return null;
    }
    const fullName = this.createFullName(userDetails);

    return (
      <div className="profile_user">
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile">
          <div className="row">
            <div className="col-md-4">
              <div className="profile-img">
                <img
                  src={userDetails.profilePic || "defaultPicUser.png"}
                  alt=""
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="profile-head">
                <h2>{fullName}</h2>
                <h5>
                  Degree name: {userDetails.degree_name || " "}
                  <br /> University name: {userDetails.university_name}
                  <br /> Year of study: {userDetails.year_of_study || " "}
                </h5>
                <Paper square>
                  <Tabs
                    value={currTab}
                    onChange={this.handleChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                  >
                    <Tab label="My Groups" />
                    <Tab label="My Courses" />
                  </Tabs>
                </Paper>
                <div>{list || this.getMyGroup()}</div>
                {userDetails.canEdit && currTab === 1 ? (
                  <button
                    className="editCoursesBtn"
                    onClick={this.getAllPossibleCourses}
                  >
                    Edit Courses
                  </button>
                ) : null}
              </div>
            </div>
            {userDetails.canEdit ? (
              /* <button className="col-md-2" onClick={this.toggleEditProfile}>Edit Profile</button> */
              <Link
                to={{
                  pathname: "/EditProfile",
                  state: {
                    fullName,
                    userDetails,
                  },
                }}
              >
                <div className="col-md-2">Edit Profile</div>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
