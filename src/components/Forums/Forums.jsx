/* eslint-disable array-callback-return */
import React, { Component } from "react";
import { isUserLoggedIn } from "../Utils/isUserLoggedIn";
import { Header } from "../Header";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/forums.css";

export default class Forums extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: null,
      forumsList: [],
    };
  }

  async componentDidMount() {
    const { history } = this.props;
    const res = await isUserLoggedIn(history, "/Forums", "/login");
    if (res) {
      const forumsList = await this.getMyForums();
      this.setState({ forumsList, isLoading: true });
    }
  }

  searchSpace = (event) => {
    let keyword = event.target.value;
    this.setState({ search: keyword });
  };

  getMyForums = async () => {
    let token = await localStorage.getItem("jwtToken");

    const reqBody = {
      jwt: token,
    };

    return axios
      .post("/api/forums/", reqBody)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data.forums;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  };

  getForumsList = () =>
    this.state.forumsList
      .filter(
        (data) =>
          this.state.search == null ||
          data.forumName
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          data.forumType
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          data.forumCourse
            .toLowerCase()
            .includes(this.state.search.toLowerCase())
      )
      .map((data) => {
        return (
          <tr>
            <td>
              <Link to={{ pathname: "/ForumPage", state: { forum: data } }}>
                {data.forumName}
              </Link>
            </td>
            <td>{data.forumType}</td>
            <td>{data.forumCourse}</td>
          </tr>
        );
      });

  render() {
    const elementStyle = {
      border: "solid",
      borderRadius: "10px",
      left: "10px",
      height: "3px",
      marginBottom: "20px",
    };
    const { isLoading } = this.state;
    if (!isLoading) {
      return null;
    }

    const items = this.getForumsList();

    return (
      <div className="mainPage_wrapper">
        <Header />
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile mainPage_container">
          <>
            <div className="profile-head">
              <h2>My Forums</h2>
            </div>
            <input
              className="input"
              type="text"
              placeholder="Search..."
              style={elementStyle}
              onChange={(e) => this.searchSpace(e)}
            />
            <div className="listOfForums">
              <table className="tableOfForums">
                <thead>
                  <tr>
                    <th className="headerColumn">Forum Name</th>
                    <th className="headerColumn">Forum Type</th>
                    <th className="headerColumn">Course Name</th>
                    <th className="headerColumn"></th>
                    <th className="headerColumn"></th>
                  </tr>
                </thead>
                <tbody> {items}</tbody>
              </table>
            </div>
          </>
        </div>
      </div>
    );
  }
}
