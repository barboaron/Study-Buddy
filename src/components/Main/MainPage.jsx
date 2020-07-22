import React, { Component } from "react";
import GroupCard from "./GroupCard";
import CardColumns from "react-bootstrap/CardColumns";
import openSocket from "socket.io-client";
import axios from "axios";
import "../styles/mainPageStyles.css";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = openSocket("http://localhost:5500");

const jwt =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYTk0Y2MxZThlNmFlMDVhMGE3Mjk5NCIsIm5hbWUiOiJJdGFpIEZhcmJlciIsImlhdCI6MTU5MDM5OTM5NywiZXhwIjoxNTkwNDIwOTk3fQ.FMNrntOF84UTPHc9lVCcJE0dsk1qoxCwwQ2DPKWAi5U"; //get jwt from somewhere

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: null,
      groupsList: [],
      currFilter: {},
      page: 1,
    };
  }

  async componentDidMount() {
    socket.emit("new-user", { jwt });
    const groupsList = await this.getStudyGroups();
    debugger;
    this.setState({ groupsList });
  }

  componentWillUnmount() {
    socket.emit("disconnect");
    socket.disconnect(true);
  }

  async getStudyGroups() {
    const { currFilter, page } = this.state;
    let token = await localStorage.getItem("jwtToken");
    debugger;
    const studyGroupsFilters = {
      jwt: token,
      page,
      filters: currFilter,
    };

    return axios
      .post("/api/studyGroups/", studyGroupsFilters)
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
    return (
      <div className="profile_user">
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile mainPage_container">
          <div className="header_container">
            <img
              className="mainPageLogo"
              src="logoStudyBuddy_Horizontal.png"
              alt="Study-Buddy"
            />
          </div>
          <div className="columns_container">
            <CardColumns>
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
            </CardColumns>
          </div>
        </div>
      </div>
    );
  }
}
