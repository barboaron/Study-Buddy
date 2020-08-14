import React, { Component } from "react";
import axios from "axios";
import "../styles/studyGroupStyles.css";

export default class ScheduleWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pollForParticipants: !!props.survey,
    };
    this.answerPoll = this.answerPoll.bind(this);
  }

  async answerPoll(event) {
    event.persist();
    event.preventDefault();

    let token = await localStorage.getItem("jwtToken");
    const groupId = this.props.groupId;
    const dates = Array.from(event?.target?.elements)
      .filter((elem) => elem.checked)
      .map((elem) => elem.value);
    debugger;

    const pollAnswers = {
      jwt: token,
      groupId,
      dates,
    };
    debugger;

    return axios
      .post("/api/studyGroups/answerSurvey", pollAnswers)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          debugger;
          this.setState({ pollForParticipants: false });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  render() {
    const { pollForParticipants } = this.state;
    const { survey } = this.props;
    debugger;

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
    ) : null;
  }
}
