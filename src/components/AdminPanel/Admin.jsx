import React, { Component } from "react";
import "../styles/adminStyle.css";
import FloatingLabel from "../Utils/floatingLabel";
import uploadFileIcon from "../Icons/uploadFileIcon";
import SearchCourses from "./SearchCourses";

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  addNewCourses = () => {};
  addNewCourseManually = () => {};

  render() {
    const userDetails = {};
    return (
      <div className="profile_user">
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />

        <div class="container emp-profile">
          <div class="profile-head">
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
              <input id="chooseFile" type="file" name="myfile" multiple />
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
