/* eslint-disable array-callback-return */
import React, { Component } from "react";
import { isUserLoggedIn } from "../Utils/isUserLoggedIn";
import { Header } from "../Header";
import axios from "axios";
import EditGroup from "./EditGroup";
import { Link } from "react-router-dom";
import "../styles/myGroupsStyle.css";

export default class MyGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: null,
      myGroupsList: [],
    };
    this.getMyGroups = this.getMyGroups.bind(this);
  }

  async componentDidMount() {
    const { history } = this.props;
    const res = await isUserLoggedIn(history, "/MyGroups", "/login");
    if (res) {
      const myGroupsList = await this.getMyGroups();
      this.setState({ myGroupsList, isLoading: true });
    }
  }

  searchSpace = (event) => {
    let keyword = event.target.value;
    this.setState({ search: keyword });
  };

  async getMyGroups() {
    let token = await localStorage.getItem("jwtToken");

    const myStudyGroups = {
      jwt: token,
    };

    return axios
      .post("/api/studyGroups/myGroups", myStudyGroups)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data.studyGroups;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  getGroupsList = () =>
    this.state.myGroupsList
      .filter((data) => {
        if (this.state.search == null) return data;
        else if (
          data.groupName
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          data.courseName
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          data.groupType.toLowerCase().includes(this.state.search.toLowerCase())
        ) {
          return data;
        }
        return;
      })
      .map((data) => {
        return (
          <tr>
            <td>
              <Link to={{ pathname: "/GroupPage", state: { group: data } }}>
                {data.groupName}
              </Link>
            </td>
            {/* <td>{data.groupName}</td> */}
            <td>{data.courseName}</td>
            <td>{data.groupType}</td>
            <td>{data.description}</td>
            <td>
              {data.isAdmin ? (
                <button
                  className="myGroupsBtn"
                  onClick={() => this.deleteGroup(data)}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="myGroupsBtn"
                  onClick={() => this.exitGroup(data)}
                >
                  Exit
                </button>
              )}
            </td>
            {data.isAdmin ? (
              <td>
                <button
                  className="myGroupsBtn"
                  onClick={() => this.editGroup(data)}
                >
                  Edit
                </button>
              </td>
            ) : null}
          </tr>
        );
      });

  editGroup = (data) => {
    this.setState({ edit_group: true, groupForEdit: data });
  };

  hideEditGroup = () => {
    this.setState({ edit_group: false, groupForEdit: {} });
  };

  updateGroupsList = (groups) => {
    this.setState({ myGroupsList: groups });
  };

  async deleteGroup(data) {
    let token = await localStorage.getItem("jwtToken");
    const deleteGroupReq = {
      jwt: token,
      groupId: data._id,
    };
    console.log(data._id);

    return axios
      .post("/api/studyGroups/deleteGroup", deleteGroupReq)
      .then((res) => {
        if (res.status !== 200) {
          alert("Error!");
        } else {
          alert("Group Deleted Successfuly");
          this.setState({ myGroupsList: res.data.studyGroups });
        }
      })
      .catch((err) => {
        alert("Error!");
      });
  }

  async exitGroup(data) {
    let token = await localStorage.getItem("jwtToken");
    const exitGroupReq = {
      jwt: token,
      groupId: data._id,
    };

    return axios
      .post("/api/studyGroups/leaveGroup", exitGroupReq)
      .then((res) => {
        if (res.status !== 200) {
          alert("Error!");
        } else {
          alert("Exit Group Completed");
          this.setState({ myGroupsList: res.data.studyGroups });
        }
      })
      .catch((err) => {
        alert("Error!");
      });
  }

  render() {
    const elementStyle = {
      border: "solid",
      borderRadius: "10px",
      left: "10px",
      height: "3px",
      marginBottom: "20px",
    };
    const { isLoading, edit_group, groupForEdit } = this.state;
    if (!isLoading) {
      return null;
    }

    const items = this.getGroupsList();

    return (
      <div className="mainPage_wrapper">
        <Header />
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile mainPage_container">
          {edit_group ? (
            <EditGroup
              groupForEdit={groupForEdit}
              hideEditGroup={this.hideEditGroup}
              updateGroupsList={this.updateGroupsList}
            />
          ) : (
            <>
              <div className="profile-head">
                <h2>My Groups</h2>
              </div>
              <input
                className="input"
                type="text"
                placeholder="Search..."
                style={elementStyle}
                onChange={(e) => this.searchSpace(e)}
              />
              <div className="listOfGroups">
                <table className="tableOfGroups">
                  <thead>
                    <tr>
                      <th className="headerColumn">Group Name</th>
                      <th className="headerColumn">Course Name</th>
                      <th className="headerColumn">Type Of Group</th>
                      <th className="headerColumn">Description</th>
                      <th className="headerColumn"></th>
                      <th className="headerColumn"></th>
                    </tr>
                  </thead>
                  <tbody> {items}</tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}
