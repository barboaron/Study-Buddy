/* eslint-disable array-callback-return */
import React, { Component } from "react";
import { isUserLoggedIn } from "../Utils/isUserLoggedIn";
import MenuBar from "../Utils/MenuBar";
import EditGroup from "./EditGroup";
import "../styles/myGroupsStyle.css";

export default class MyGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: null,
    };
    // this.getMyGroups = this.getMyGroups.bind(this);
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
  getMyGroups = () => {};

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
            <td>{data.groupName}</td>
            <td>{data.courseName}</td>
            <td>{data.groupType}</td>
            <td>{data.description}</td>
            <td>
              {data.isCreator ? (
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
            {data.isCreator ? (
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

  deleteGroup = () => {};
  exitGroup = () => {};

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
        <MenuBar />
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
