import React from "react";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import axios from "axios";
import { socket } from "./../Header";

class ViewDetailsPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.getParicipantsDetails = this.getParicipantsDetails.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
  }

  componentDidMount() {
    this.getParicipantsDetails();
  }

  async getParicipantsDetails() {
    const { participants } = this.props.groupForPopup;
    Promise.all(
      participants.map(async (user) => await this.getUserDetails(user.id))
    ).then((data) => {
      this.setState({ detailsArray: data, isLoading: true });
    });
  }

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

  joinToGroup = () => {
    const { showQuestions } = this.state;
    const { questions } = this.props.groupForPopup;
    let answers = [];
    if (!showQuestions) {
      this.setState({ showQuestions: true });
    } else {
      answers = questions.map(
        (question, idx) => document.getElementById(`Q${idx}`).value
      );
      //pass the answers to the server
    }
    let jwt = localStorage.getItem("jwtToken");
    socket.emit("request-join-group", {
      jwt,
      group: this.props.groupForPopup,
      answers,
    });
  };

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

  createFullName = (firstName, lastName) => {
    return (
      firstName[0].toUpperCase() +
      firstName.substring(1) +
      " " +
      lastName[0].toUpperCase() +
      lastName.substring(1)
    );
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

  render() {
    const { groupForPopup, closePopup } = this.props;
    const {
      creatorName,
      courseName,
      groupType,
      date,
      questions,
      participants,
      maxParticipants,
      description,
      groupName,
      isInGroup,
      isFull,
    } = groupForPopup;

    const { showQuestions, isLoading } = this.state;
    if (!isLoading) {
      return null;
    }
    const dateAndTime = date && new Date(date);

    return (
      <div className="popup">
        <div className="popup_inner">
          <h1>{groupName || "Study Group"}</h1>
          {showQuestions && questions.length > 0 ? (
            <div className="popup_questions_wrapper">
              Please answer the following questions to complete your joining the
              group:
              <br />
              {questions.map((elem, idx) => (
                <div key={`Question${idx}`} className="popup_question">
                  <label className="popup_question_label" htmlFor={`Q${idx}`}>
                    {elem}
                  </label>
                  <input
                    className="input"
                    id={`Q${idx}`}
                    type="text"
                    name={`Q${idx}`}
                    required={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <h5 className="containerPopup_wrapper">
              <div className="containerPopup">
                <span className="subtitlePopup">Course name: </span>
                {courseName || " "}
              </div>
              <div className="containerPopup">
                <span className="subtitlePopup">Group Type: </span>
                {groupType || " "}
              </div>
              <div className="containerPopup">
                <span className="subtitlePopup"> Created By: </span>
                {creatorName || " "}
              </div>
              {description ? (
                <div className="containerPopup">
                  <span className="subtitlePopup"> Description: </span>
                  {description}
                </div>
              ) : null}
              {date ? (
                <div className="containerPopup">
                  <span className="subtitlePopup"> Date: </span>
                  {dateAndTime.toLocaleString()}
                </div>
              ) : null}
              <div className="containerPopup">
                <span className="subtitlePopup">
                  Participants ({participants.length}/{maxParticipants}):
                </span>
                {participants.map((elem, idx) => (
                  <OverlayTrigger
                    trigger="hover"
                    placement="top"
                    overlay={this.getPopover(idx)}
                  >
                    <span className={"participantName"}> {elem.name} </span>
                  </OverlayTrigger>
                ))}
              </div>
            </h5>
          )}
          <button className="popupsBtn" onClick={closePopup}>
            X Close Me
          </button>
          {!isInGroup && !isFull ? (
            <button className="popupsBtn" onClick={this.joinToGroup}>
              Join Group
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}

export default ViewDetailsPopup;
