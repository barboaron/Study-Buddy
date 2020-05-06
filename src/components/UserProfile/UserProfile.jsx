import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import axios from "axios";
import { isUserLoggedIn } from "../Utils/isUserLoggedIn";
import EditProfile from "./EditProfile";
import "../styles/userProfileStyle.css";

export default class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currTab: 0,
      isEditProfile: false,
    };
    this.getUserID = this.getUserID.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
    this.renderPossibleCourses = this.renderPossibleCourses.bind(this);
    this.getAllPossibleCourses = this.getAllPossibleCourses.bind(this);
    this.editUserCourses = this.editUserCourses.bind(this);
  }

  async componentDidMount() {
    const { history } = this.props;
    isUserLoggedIn(history, "/UserProfile", "/login");

    const user_id = await this.getUserID();
    const user_details = await this.getUserDetails(user_id);
    this.setState({ user_id, userDetails: user_details.data, isLoading: true });
  }

  handleChange = (_, newValue) => {
    let isEditCourses,
      list = [];
    switch (newValue) {
      case 0:
        list = this.getMyGroup();
        break;
      case 1:
        list = this.getMyCourses();
        isEditCourses = false;
        break;
      default:
        break;
    }
    this.setState({ currTab: newValue, list, isEditCourses });
  };

  getMyGroup = () => {
    const { study_groups } = this.state?.userDetails;
    return study_groups.length !== 0 ? study_groups : ["No Groups"];
  };

  getMyCourses = () => {
    const { courses } = this.state?.userDetails;
    return courses.length !== 0
      ? this.createListFromArray(courses)
      : ["No Courses"];
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
          return res;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  createListFromArray = (array) => (
    <div className="cousrsesList">
      {array.map((elem) => (
        <div className="cousrsesList_Item">
          {elem.name}
          <br />
        </div>
      ))}
    </div>
  );

  async editUserCourses(event) {
    event.preventDefault();
    const coursesIds = Array.from(event?.target?.elements)
      .filter((elem) => elem.checked)
      .map((elem) => elem.value);

    let token = await localStorage.getItem("jwtToken");
    const coursesData = {
      jwt: token,
      coursesIds,
    };

    return axios
      .post("/api/profiles/editCourses", coursesData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          const { userDetails, isEditCourses } = this.state;
          userDetails.courses = res.data;
          const list = this.createListFromArray(res.data);
          this.setState({
            list,
            userDetails,
            isEditCourses: !isEditCourses,
          });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async renderPossibleCourses() {
    const { isEditCourses, userDetails } = this.state;
    const courses = await this.getAllPossibleCourses();
    const currUserCourses = userDetails.courses;
    const list = (
      <form onSubmit={this.editUserCourses}>
        <div className="cousrsesList">
          {courses.map((course, index) => {
            const ischecked = currUserCourses.find(
              (element) => element.id === course.id
            );
            return (
              <>
                <input
                  className="courseItemCheckbox"
                  type="checkbox"
                  name={index}
                  value={course.id}
                  defaultChecked={ischecked}
                />
                <label className="cousrsesList_Item" htmlFor={index}>
                  {course.name}
                </label>
                <br />
              </>
            );
          })}
        </div>
        <button className="editCoursesBtn" type="submit">
          Edit
        </button>
      </form>
    );
    this.setState({ list, isEditCourses: !isEditCourses });
  }

  async getAllPossibleCourses() {
    let token = await localStorage.getItem("jwtToken");

    const reqData = {
      jwt: token,
    };
    return axios
      .post("/api/courses/", reqData)
      .then((res) => {
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

  updateUserDetails = (newDetails) => {
    const { userDetails } = this.state;
    userDetails.degree_name = newDetails?.degree_name;
    userDetails.year_of_study = newDetails?.year_of_study;
    return userDetails;
  };

  toggleEditProfile = (newDetails) => {
    const { isEditProfile } = this.state;
    const userDetails = newDetails
      ? this.updateUserDetails(newDetails)
      : this.state.userDetails;
    this.setState({ isEditProfile: !isEditProfile, userDetails, currTab: 0 });
  };

  render() {
    const {
      list,
      userDetails,
      isLoading,
      currTab,
      isEditProfile,
      isEditCourses,
    } = this.state;
    if (!isLoading) {
      return null;
    }
    const fullName = this.createFullName(userDetails);

    return isEditProfile ? (
      <EditProfile
        fullName={fullName}
        userDetails={userDetails}
        toggleEditProfile={this.toggleEditProfile}
      />
    ) : (
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
                  <span className="titleDetails">Degree name: </span>
                  {userDetails.degree_name || " "}
                  <br /> <br />
                  <span className="titleDetails">University name: </span>
                  {userDetails.university_name}
                  <br /> <br />
                  <span className="titleDetails"> Year of study: </span>
                  {userDetails.year_of_study || " "}
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
                {list || this.getMyGroup()}
                {!isEditCourses && userDetails.canEdit && currTab === 1 && (
                  <button
                    className="editCoursesBtn"
                    onClick={this.renderPossibleCourses}
                  >
                    Edit Courses
                  </button>
                )}
              </div>
            </div>
            {userDetails.canEdit ? (
              <button
                className="editProfileBtn"
                onClick={() => this.toggleEditProfile()}
              >
                Edit Profile
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
