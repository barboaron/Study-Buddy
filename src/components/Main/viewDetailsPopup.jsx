import React from "react";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import axios from "axios";

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
    // need to fix
    const { participants } = this.props.groupForPopup;
    debugger;
    const detailsArray = await participants.map(async (user) => {
      return await this.getUserDetails(user.id);
    });
    debugger;
    this.setState({ detailsArray });
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
          debugger;
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
    if (!showQuestions) {
      this.setState({ showQuestions: true });
    } else {
      const answers = questions.map(
        (question, idx) => document.getElementById(`Q${idx}`).value
      );
      //pass the answers to the server
    }
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
    } = groupForPopup;

    const { showQuestions } = this.state;
    debugger;
    const dateAndTime = date && new Date(date);

    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Popover</Popover.Title>
        <Popover.Content>
          And here's some <strong>amazing</strong> content. It's very engaging.
          right?
        </Popover.Content>
      </Popover>
    );
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
                {participants.map((elem) => (
                  <OverlayTrigger
                    trigger="hover"
                    placement="top"
                    overlay={popover}
                  >
                    <span> {elem.name} </span>
                  </OverlayTrigger>
                ))}
              </div>
            </h5>
          )}
          <button className="popupsBtn" onClick={closePopup}>
            X Close Me
          </button>
          <button className="popupsBtn" onClick={this.joinToGroup}>
            Join Group
          </button>
        </div>
      </div>
    );
  }
}

export default ViewDetailsPopup;
