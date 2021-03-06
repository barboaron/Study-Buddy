import React, { Component } from "react";
import axios from "axios";
import "../styles/studyGroupStyles.css";

/* Poll component is a util component for ScheduleWrapper.
This component appears in the participants's group page in the schedule tab after the creator's group created a new poll, 
so they can vote it.*/
export default class Poll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pollForParticipants: props.survey.length > 0 && !props.didAnswerSurvey,
      didAnswerSurvey: props.didAnswerSurvey,
    };
    this.answerPoll = this.answerPoll.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { survey, didAnswerSurvey } = nextProps;
    const pollForParticipants = survey.length > 0 && !didAnswerSurvey;
    this.setState({ didAnswerSurvey, pollForParticipants });
  }

  async answerPoll(event) {
    event.persist();
    event.preventDefault();

    let token = await localStorage.getItem("jwtToken");
    const groupId = this.props.groupId;
    const dates = Array.from(event?.target?.elements)
      .filter((elem) => elem.checked)
      .map((elem) => elem.value);

    const pollAnswers = {
      jwt: token,
      groupId,
      dates,
    };

    return axios
      .post("/api/studyGroups/answerSurvey", pollAnswers)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.props.updateDidAnswer(res.data.surveyEnded);
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  render() {
    const { pollForParticipants, didAnswerSurvey } = this.state;
    const { survey } = this.props;

    return pollForParticipants ? (
      <form onSubmit={this.answerPoll}>
        <div className="pollList">
          {survey.map((option, index) => {
            const dateAndTime = new Date(option.date).toLocaleString();
            return (
              <>
                <input type="checkbox" name={index} value={option.date} />
                <label className="pollList_Item" htmlFor={index}>
                  {dateAndTime}
                </label>
                <br />
              </>
            );
          })}
        </div>
        <button type="submit">Answer Poll</button>
      </form>
    ) : (
      <span className="msgPollCreated">
        {didAnswerSurvey
          ? "Thanks for your vote! Wait for results..."
          : "No poll found for this group"}
        <br />
      </span>
    );
  }
}
