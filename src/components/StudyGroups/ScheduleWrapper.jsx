import React, { Component } from "react";
import axios from "axios";
import DateAndTimePicker from "../Utils/DateAndTimePicker";
import Poll from "../Utils/Poll";
import "../styles/scheduleWrapperStyle.css";

/* ScheduleWrapper component is a util component for schedule helper feature 
that enables the creator's group to create a poll in order to schedule in a comfortable way between all the participants,
and enables the paricipants to vote this poll.
When all the participants vote, the date that chosen will be shown in the group's details*/
export default class ScheduleWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDateAndTimePickers:
        props.group.isAdmin && props.group.survey.length === 0,
      pollSucceedMsgToAdmin:
        props.group.isAdmin && props.group.survey.length > 0,
    };
    this.createPoll = this.createPoll.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { survey, isAdmin } = nextProps.group;
    const showDateAndTimePickers = isAdmin && survey.length === 0;
    const pollSucceedMsgToAdmin = isAdmin && survey.length > 0;
    this.setState({ showDateAndTimePickers, pollSucceedMsgToAdmin });
  }

  async createPoll(event) {
    event.persist();
    event.preventDefault();

    let token = await localStorage.getItem("jwtToken");
    const { _id } = this.props.group;
    const date1 = event?.target?.elements?.Picker1?.value;
    const date2 = event?.target?.elements?.Picker2?.value;
    const date3 = event?.target?.elements?.Picker3?.value;
    const date4 = event?.target?.elements?.Picker4?.value;
    const date5 = event?.target?.elements?.Picker5?.value;
    const dates = [];
    date1 && dates.push(date1);
    date2 && dates.push(date2);
    date3 && dates.push(date3);
    date4 && dates.push(date4);
    date5 && dates.push(date5);

    const pollData = {
      jwt: token,
      groupId: _id,
      dates,
    };

    return axios
      .post("/api/studyGroups/createSurvey", pollData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.props.updateGroupWithSurvey(res.data);
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  getComponent = () => {
    const { showDateAndTimePickers, pollSucceedMsgToAdmin } = this.state;
    const { survey, _id, didAnswerSurvey } = this.props.group;
    let component;
    if (showDateAndTimePickers) {
      component = (
        <form className="picker_Form" onSubmit={this.createPoll}>
          <DateAndTimePicker />
          <button className="picker_submitBtn" type="submit">
            Submit
          </button>
        </form>
      );
    } else if (pollSucceedMsgToAdmin) {
      component = (
        <span className="msgPollCreated">
          Poll created successfully! Wait for results...
          <br />
        </span>
      );
    } else {
      component = (
        <Poll
          survey={survey}
          groupId={_id}
          didAnswerSurvey={didAnswerSurvey}
          updateDidAnswer={this.props.updateDidAnswer}
        />
      );
    }
    return component;
  };

  render() {
    return this.getComponent();
  }
}
