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
      list: this.getMyGroup(),
    };
    this.getUserID = this.getUserID.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
  }

  async componentDidMount() {
    const user_id = await this.getUserID();
    const user_details = await this.getUserDetails(user_id);
    this.setState({ user_id, user_details });
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
    return ["groups", "bla"];
  };

  getMyCourses = () => {
    return ["courses", "bla"];
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
          // this.setState({ user_id: res.data.id });
          return res.data.id;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async getUserDetails(user_id) {
    const token = await localStorage.getItem("jwtToken");
    // const { user_id } = this.state;

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

  render() {
    const userDetails = {};
    const { list } = this.state;
    const { history } = this.props;
    isUserLoggedIn(history, "/UserProfile", "/login");

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
                <h2>{userDetails.name || "Bar Boaron"}</h2>
                <h5>
                  Degree name: {userDetails.degreeName || "Computer Science"}
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
                <div className="col-md-2">Edit Profile</div>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
