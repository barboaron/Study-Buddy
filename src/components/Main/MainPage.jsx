import React, { Component } from "react";
import GroupCard from "./GroupCard";
import CardColumns from "react-bootstrap/CardColumns";
import axios from "axios";
import Filters from "./FiltersBar";
import "../styles/mainPageStyles.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: null,
      groupsList: [],
      currFilter: {},
      page: 1,
      hasNextPage: true,
    };
    this.getStudyGroups = this.getStudyGroups.bind(this);
  }

  async componentDidMount() {
    await this.getStudyGroups();
  }

  // async componentDidUpdate(prevState) {
  //   if (prevState.currFilter !== this.state.currFilter)
  //     await this.getStudyGroups(true);
  // }

  async getStudyGroups(filter, isNewFilter) {
    const { currFilter, page } = this.state;
    let token = await localStorage.getItem("jwtToken");
    let currPage = isNewFilter ? 1 : page;

    const studyGroupsFilters = {
      jwt: token,
      page: currPage,
      filters: filter || currFilter,
    };
    debugger;
    return axios
      .post("/api/studyGroups/", studyGroupsFilters)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          if (res.data.hasNextPage) {
            currPage++;
          }
          this.setState({
            groupsList: res.data.studyGroups,
            hasNextPage: res.data.hasNextPage,
            page: currPage,
            currFilter: filter || currFilter,
          });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  onFilterBy = (event) => {
    const courseName = event?.target?.elements?.courseName?.value;
    const groupType = event?.target?.elements?.groupType?.value;
    const date = event?.target?.elements?.date?.value;
    const numOfParticipant = event?.target?.elements?.maxParticipants?.value;
    const filter = {
      courseName,
      groupType,
      date,
      numOfParticipant,
    };
    this.getStudyGroups(filter, true);
    // this.setState({
    //   currFilter: {
    //     courseName,
    //     groupType,
    //     date,
    //     numOfParticipant,
    //   },
    // });
  };

  render() {
    const { groupsList } = this.state;
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
            <Filters onFilterBy={this.onFilterBy} />
          </div>
          <div className="columns_container">
            <CardColumns>
              {groupsList.map((group) => (
                <GroupCard
                  groupType={group.groupType}
                  description={group.description}
                  courseName={group.courseName}
                  creatorName={group.creatorName}
                  groupName={group.groupName}
                />
              ))}
            </CardColumns>
          </div>
        </div>
      </div>
    );
  }
}
