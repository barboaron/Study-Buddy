import React, { Component } from "react";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import axios from "axios";
import { Header } from "../Header";
import "../styles/groupPageStyles.css";

export default class GroupPage extends Component {
  constructor(props) {
    super(props);
    this.state = { currTab: 0 };
    this.getParicipantsDetails = this.getParicipantsDetails.bind(this);
  }

  componentDidMount() {
    !this.breakRender && this.getParicipantsDetails();
  }

  componentWillMount() {
    if (!this.props?.location?.state?.group) {
      this.props.history.push("/");
      this.breakRender = true;
    }
  }

  async getParicipantsDetails() {
    const { participants } = this.props.location.state.group;
    Promise.all(
      participants.map(async (user) => await this.getUserDetails(user.id))
    ).then((data) => {
      this.setState({ detailsArray: data, isLoading: true });
    });
  }

  //   createListFromArray = (array, isGroups) => (
  //     <div className="cousrsesList">
  //       {array.map((elem) => (
  //         <div className="cousrsesList_Item">
  //           {isGroups ? elem.groupName || elem.courseName : elem.name}
  //           <br />
  //         </div>
  //       ))}
  //     </div>
  //   );

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

  handleChange = (_, newValue) => {
    // let isEditCourses,
    //   list = [];
    // const { groups } = this.state;
    // switch (newValue) {
    //   case 0:
    //     list =
    //       groups.length !== 0
    //         ? this.createListFromArray(groups, true)
    //         : ["No Groups"];
    //     break;
    //   case 1:
    //     list = this.getMyCourses();
    //     isEditCourses = false;
    //     break;
    //   default:
    //     break;
    // }
    this.setState({ currTab: newValue });
  };

  render() {
    const { isLoading, currTab } = this.state;

    if (!isLoading) {
      return null;
    }
    const { group } = this.props.location.state;
    const dateAndTime = group.date && new Date(group.date);

    return (
      <div className="profile_user">
        <Header />
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile">
          <div className="row">
            <div className="col-md-4">
              <div className="profile-img">
                <div className="containerPopup">
                  <span className="subtitle">
                    Participants ({group.participants.length}/
                    {group.maxParticipants}):
                  </span>
                  <br />
                  {group.participants.map((elem, idx) => (
                    <OverlayTrigger
                      trigger="hover"
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
            <div className="col-md-6">
              <div className="profile-head">
                <h2 className="UserProfileTitle">
                  {group.groupName || "Group Page"}
                </h2>
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
                    </>
                  ) : null}
                  {group.date ? (
                    <>
                      <span className="titleDetails"> Date: </span>
                      {dateAndTime.toLocaleString()}
                    </>
                  ) : null}
                </h5>
              </div>
            </div>
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
              {/* {list}  */}
              {/* {!isEditCourses && userDetails.canEdit && currTab === 1 && (
                  <button
                    className="editCoursesBtn"
                    onClick={this.renderPossibleCourses}
                  >
                    Edit Courses
                  </button>
                )} */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
