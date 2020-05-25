import React, { Component } from "react";
import "../styles/adminStyle.css";
import FloatingLabel from "../Utils/floatingLabel";
import uploadFileIcon from "../Icons/uploadFileIcon";
import SearchCourses from "./SearchCourses";
// import { isUserLoggedIn } from "../Utils/isUserLoggedIn";
import axios from "axios";

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.getAdminCoursesList = this.getAdminCoursesList.bind(this);
    this.addNewCourseManually = this.addNewCourseManually.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
    this.addNewCoursesByFile = this.addNewCoursesByFile.bind(this);
  }

  async componentDidMount() {
    const coursesList = await this.getAdminCoursesList();
    this.setState({ coursesList, isLoading: true });
  }

  async addNewCoursesByFile(event) {
    //need to check
    event.persist();
    event.preventDefault();

    const file = event?.target?.elements[1].files[0];
    const data = new FormData();
    data.append("file", file);
    let token = await localStorage.getItem("jwtToken");

    return axios
      .post("/api/admins/readFromCsv", data, {
        headers: {
          jwt: `${token}`,
        },
      })
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          alert("Courses Added successfuly!");
          this.setState({ coursesList: res.data });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async addNewCourseManually(event) {
    event.preventDefault();

    const degreeName = event?.target?.elements?.degreeName?.value;
    const courseName = event?.target?.elements?.courseName?.value;
    let token = await localStorage.getItem("jwtToken");
    const courseDetails = {
      jwt: token,
      degreeName: degreeName,
      courseName: courseName,
    };

    return axios
      .post("/api/admins/addCourse", courseDetails)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          alert("Course added successfuly!");
          this.setState({ coursesList: res.data });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async deleteCourse(data) {
    let token = await localStorage.getItem("jwtToken");

    const courseDetails = {
      jwt: token,
      courseId: data.id,
    };

    return axios
      .post("/api/admins/deleteCourse", courseDetails)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          alert("Course deleted successfuly!");
          this.setState({ coursesList: res.data });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async getAdminCoursesList() {
    let token = await localStorage.getItem("jwtToken");

    const myToken = {
      jwt: token,
    };

    return axios
      .post("/api/admins/courses", myToken)
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

  render() {
    const { coursesList, isLoading } = this.state;
    if (!isLoading) {
      return null;
    }
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
            <h2 className="adminPanelTitle"> Admin Panel </h2>
            <form id="addCourse" onSubmit={this.addNewCourseManually}>
              <h4> Add Course Manually: </h4>
              <FloatingLabel
                placeholder="Degree Name"
                type="text"
                name="degreeName"
                content="Degree Name:"
                className="addCourseLabels"
              />
              <FloatingLabel
                placeholder="Course Name"
                type="text"
                name="courseName"
                content="Course Name:"
                className="addCourseLabels"
              />
              <button className="addCourseButton" type="submit">
                Add Course
              </button>
            </form>
            <form id="addCourse" onSubmit={this.addNewCoursesByFile}>
              <h4> Add Courses By File: </h4>
              <button className="uploadFileBtn" type="submit">
                {uploadFileIcon()}
              </button>
              <input
                id="chooseFile"
                className="input"
                type="file"
                accept=".csv"
                name="myfile"
              />
            </form>
            <SearchCourses
              coursesList={coursesList}
              deleteCourse={this.deleteCourse}
            />
          </div>
        </div>
      </div>
    );
  }
}
