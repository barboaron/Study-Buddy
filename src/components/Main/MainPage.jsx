import React, { Component } from "react";
import GroupCard from "./GroupCard";
import CardColumns from "react-bootstrap/CardColumns";
import axios from "axios";
import Filters from "./FiltersBar";
import { isUserLoggedIn } from "../Utils/isUserLoggedIn";
import { Header } from "../Header";
import ViewDetailsPopup from "./viewDetailsPopup";
import "../styles/mainPageStyles.css";

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: null,
      groupsList: [],
      currFilter: {},
      page: 1,
      hasNextPage: true,
      showPopup: false,
    };
    this.getStudyGroups = this.getStudyGroups.bind(this);
  }

  async componentDidMount() {
    const { history } = this.props;
    const res = await isUserLoggedIn(history, "/", "/login");
    res && this.getStudyGroups();
  }

  async getStudyGroups(isNewFilter, shouldClosePopup) {
    const {
      currFilter,
      page,
      groupsList,
      showPopup,
      groupForPopup,
    } = this.state;
    let token = await localStorage.getItem("jwtToken");
    let currPage = isNewFilter || shouldClosePopup ? 1 : page;
    const show_popup = shouldClosePopup ? !showPopup : showPopup;
    const studyGroupsFilters = {
      jwt: token,
      page: currPage,
      filters: currFilter,
    };
    return axios
      .post("/api/studyGroups/", studyGroupsFilters)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          if (res.data.hasNextPage) {
            currPage++;
          }
          const studyGroupsList =
            isNewFilter || shouldClosePopup
              ? res.data.studyGroups
              : [...groupsList, ...res.data.studyGroups];

          this.setState({
            groupsList: studyGroupsList,
            hasNextPage: res.data.hasNextPage,
            page: currPage,
            isLoading: true,
            showPopup: show_popup,
            groupForPopup: shouldClosePopup ? {} : groupForPopup,
          });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  onFilterBy = (filter) => {
    this.setState(
      {
        currFilter: filter,
      },
      () => this.getStudyGroups(true)
    );
  };

  onScroll = () => {
    const { hasNextPage } = this.state;
    if (
      hasNextPage &&
      document.documentElement.scrollHeight -
        document.documentElement.scrollTop ===
        document.documentElement.clientHeight
    ) {
      this.getStudyGroups();
    }
  };

  togglePopup = (group = {}) => {
    this.setState({
      showPopup: !this.state.showPopup,
      groupForPopup: group,
    });
  };

  updateGroupsList = () => {
    const shouldClosePopup = true;
    const isNewFilter = false;
    this.getStudyGroups(isNewFilter, shouldClosePopup);
  };

  render() {
    const { groupsList, groupForPopup, isLoading } = this.state;
    const errorMsg = "Sorry, there are no relevant results";
    if (!isLoading) {
      return null;
    }

    return (
      <div className="mainPage_wrapper">
        <Header />
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
          <div className="columns_container" onScroll={this.onScroll}>
            {groupsList.length === 0 ? (
              <h1 className="errMsg_NoResults">{errorMsg}</h1>
            ) : (
              <CardColumns>
                {groupsList.map((group) => (
                  <GroupCard viewDetails={this.togglePopup} group={group} />
                ))}
              </CardColumns>
            )}
          </div>
          {this.state.showPopup ? (
            <ViewDetailsPopup
              updateGroupsList={this.updateGroupsList}
              closePopup={this.togglePopup}
              groupForPopup={groupForPopup}
            />
          ) : null}
        </div>
      </div>
    );
  }
}
