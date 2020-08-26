import React, { Component } from "react";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Feed } from "semantic-ui-react";
import axios from "axios";
import { Header } from "../Header";
import FeedEvent from "./FeedEvent";
import ScheduleWrapper from "./ScheduleWrapper";
import "../styles/groupPageStyles.css";
import { socket } from "./../Header";

/* GroupPage component has the collaboration feature and the schedule helper and all the details of the studyGroup.*/
export default class GroupPage extends Component {
  constructor(props) {
    super(props);
    this.state = { currTab: 0 };
    this.getParicipantsDetails = this.getParicipantsDetails.bind(this);
    this.getAllPosts = this.getAllPosts.bind(this);
    this.addNewPost = this.addNewPost.bind(this);
    this.getGroupDetails = this.getGroupDetails.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.getUserID = this.getUserID.bind(this);
  }

  async componentDidMount() {
    if (!this.breakRender) {
      const group = await this.getGroupDetails();
      const detailsArray = await this.getParicipantsDetails(group);
      const posts = await this.getAllPosts();
      const myId = await this.getUserID();
      this.setState({ detailsArray, posts, group, myId, isLoading: true });
    }
  }

  componentWillMount() {
    if (!this.props?.location?.state?.groupId) {
      this.props.history.push("/");
      this.breakRender = true;
    }
  }

  async getUserID() {
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
          return res.data.id;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async getParicipantsDetails(group) {
    const { participants } = group;
    return Promise.all(
      participants.map(async (user) => await this.getUserDetails(user.id))
    ).then((data) => {
      return data;
    });
  }

  async getGroupDetails() {
    let token = await localStorage.getItem("jwtToken");
    const { groupId } = this.props.location.state;
    const getGroupData = {
      jwt: token,
      groupId,
    };

    return axios
      .post("/api/studyGroups/group", getGroupData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data.group;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  handleChange = (_, newValue) => {
    this.setState({ currTab: newValue });
  };

  createFullName = (firstName, lastName) => {
    return (
      firstName[0].toUpperCase() +
      firstName.substring(1) +
      " " +
      lastName[0].toUpperCase() +
      lastName.substring(1)
    );
  };

  async getUserDetails(user_id) {
    const token = await localStorage.getItem("jwtToken");
    const reqData = {
      jwt: token,
      userId: user_id,
    };

    return axios
      .post("/api/profiles/profile", reqData)
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

  getPopover = (index) => {
    const { detailsArray } = this.state;

    if (detailsArray) {
      const fullNameStudent = this.createFullName(
        detailsArray[index].firstName,
        detailsArray[index].lastName
      );

      const popover = (
        <Popover id="popover-basic">
          <Popover.Title as="h3">
            <img
              width={"55px"}
              height={"55px"}
              src={detailsArray[index].imgSrc}
              alt=""
            />
            <span className="tooltip_fullName">{fullNameStudent}</span>
          </Popover.Title>
          <Popover.Content>
            <span className="tooltip_content">
              {this.createContentForPopover({
                fullNameStudent,
                year: detailsArray[index].year_of_study,
                degree_name: detailsArray[index].degree_name,
                university_name: detailsArray[index].university_name,
              })}
            </span>
          </Popover.Content>
        </Popover>
      );

      return popover;
    } else {
      return null;
    }
  };

  createContentForPopover = ({
    fullNameStudent,
    year,
    degree_name,
    university_name,
  }) => {
    let ending;
    if (year === 1) {
      ending = "st";
    } else if (year === 2) {
      ending = "nd";
    } else {
      ending = "rd";
    }
    return (
      fullNameStudent +
      " is a " +
      year +
      ending +
      " year " +
      degree_name +
      " student at " +
      university_name +
      ".\n"
    );
  };

  async getAllPosts() {
    let token = await localStorage.getItem("jwtToken");
    const { groupId } = this.props.location.state;

    const getAllPosts = {
      jwt: token,
      groupId,
    };

    return axios
      .post("/api/studyGroups/posts", getAllPosts)
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

  async addNewPost(event) {
    event.persist();
    event.preventDefault();
    const files = event?.target?.elements[1]?.files;
    if (files?.length > 10) {
      alert("You are only allowed to upload a maximum of 10 files");
      event.target.elements[1].value = "";
      return;
    }

    let token = await localStorage.getItem("jwtToken");
    const { groupId } = this.props.location.state;
    const content = event?.target?.elements?.postTextArea?.value;
    const data = new FormData();
    data.append("jwt", token);
    data.append("groupId", groupId);
    data.append("content", content);

    if (files?.length > 0)
      Object.values(files).map((file) => data.append("file", file));
    if (content) event.target.elements.postTextArea.value = "";
    if (files) event.target.elements[1].value = "";

    return axios
      .post("/api/studyGroups/addPost", data)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.setState({ posts: res.data });
          this.sendNotification();
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  sendNotification = () => {
    let jwt = localStorage.getItem("jwtToken");
    socket.emit("collaboration-msg", {
      jwt,
      group: this.state.group,
    });
  }

  async deletePost(postId) {
    let token = await localStorage.getItem("jwtToken");
    const { _id } = this.state.group;

    const postDetails = {
      jwt: token,
      groupId: _id,
      postId,
    };

    return axios
      .post("/api/studyGroups/deletePost", postDetails)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.setState({ posts: res.data });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  updateGroupWithSurvey = (survey) => {
    const { group } = this.state;
    group.survey = survey;
    this.setState({ group });
  };

  updateDidAnswer = (surveyEnded) => {
    const { group } = this.state;
    group.didAnswerSurvey = true;
    if (surveyEnded) {
      group.survey = [];
    }
    this.setState({ group });
  };

  getContentByCurrTab = () => {
    const { currTab, posts, group, myId } = this.state;
    return currTab === 0 ? (
      <>
        <form className={"formPosts"} onSubmit={this.addNewPost}>
          <textarea
            id="postTextArea"
            name="postTextArea"
            rows="2"
            cols="50"
            placeholder="Add post..."
          />
          <br />
          <input id="chooseFile" type="file" name="myfile" multiple />
          <button
            type="submit"
            style={{ padding: "8px 33px", marginLeft: "23%" }}
          >
            Post
          </button>
        </form>
        <Feed>
          {posts.map((post) => (
            <FeedEvent
              files={post.files}
              canDelete={myId === post.creatorId}
              postId={post._id}
              imgSrc={post.creatorImgSrc}
              userName={post.creatorName}
              action={"posted"}
              date={new Date(post.creationDate).toLocaleString()}
              content={post.content}
              deletePost={this.deletePost}
            />
          ))}
        </Feed>
      </>
    ) : (
      <ScheduleWrapper
        group={group}
        updateGroupWithSurvey={this.updateGroupWithSurvey}
        updateDidAnswer={this.updateDidAnswer}
      />
    );
  };

  render() {
    const { isLoading, currTab, group } = this.state;

    if (!isLoading) {
      return null;
    }
    const dateAndTime = group.date && new Date(group.date);
    return (
      <div className="groupPageWrapper">
        <Header />
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile groupPage">
          <div className="profile-head">
            <h2 className="groupPageTitle">
              {group.groupName || "Group Page"}
            </h2>
          </div>
          <div className="row">
            <div className="tabsContainer">
              <Paper square>
                <Tabs
                  value={currTab}
                  onChange={this.handleChange}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="Colaboration" />
                  <Tab label="Schedual Helper" />
                </Tabs>
              </Paper>
              {this.getContentByCurrTab()}
            </div>
            <div className="detailsContainer">
              <h5 className="details">
                <span className="titleDetails"> Course Name: </span>
                {group.courseName || " "}
                <br /> <br />
                <span className="titleDetails"> Group Type: </span>
                {group.groupType}
                <br /> <br />
                {group.description ? (
                  <>
                    <span className="titleDetails"> Description:</span>
                    {group.description}
                    <br />
                    <br />
                  </>
                ) : null}
                {group.date ? (
                  <>
                    <span className="titleDetails"> Date: </span>
                    {dateAndTime.toLocaleString()}
                    <br />
                  </>
                ) : null}
              </h5>
              <div className="participantsWrapper">
                <span className="subtitle">
                  Participants ({group.participants.length}/
                  {group.maxParticipants}):
                </span>
                <br />
                {group.participants.map((elem, idx) => (
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="top"
                    overlay={this.getPopover(idx)}
                  >
                    <span className={"participant"}>
                      {elem.name}
                      <br />
                    </span>
                  </OverlayTrigger>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
