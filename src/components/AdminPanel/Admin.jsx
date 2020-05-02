import React, { Component } from "react";
import "../styles/adminStyle.css";
import FloatingLabel from "../Utils/floatingLabel";
import uploadFileIcon from "../Icons/uploadFileIcon";
import SearchCourses from "./SearchCourses";
// import { isUserLoggedIn } from "../Utils/isUserLoggedIn";

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  addNewCourses = () => {};
  addNewCourseManually = () => {};

  render() {
    const userDetails = {};
    // const { history } = this.props;
    // isUserLoggedIn(history, "/");
    return (
      <div className="profile_user">
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />

        <div className="container emp-profile">
          <div className="profile-head">
            <h2> Admin Panel - {userDetails.university || "MTA"}</h2>
            <form id="addCourseManually" onSubmit={this.addNewCourseManually}>
              <h4> Add Course Manually: </h4>
              <FloatingLabel
                placeholder="Degree name"
                type="text"
                name="degree"
                content="Degree name:"
                className="addCourseLabels"
              />
              <FloatingLabel
                placeholder="Course Name"
                type="text"
                name="CourseName"
                content="Course Name:"
                className="addCourseLabels"
              />
              <button className="addCourseButton" type="submit">
                Add Course
              </button>
            </form>
            <form id="addCourseManually" onSubmit={this.addNewCourses}>
              <h4> Add Courses By File: </h4>
              <input
                id="chooseFile"
                className="input"
                type="file"
                name="myfile"
                multiple
              />
              <br />
              <br />
              <button className="uploadFileBtn" type="submit">
                {uploadFileIcon()}
              </button>
            </form>
            <SearchCourses />
          </div>
        </div>
      </div>
    );
  }
}
