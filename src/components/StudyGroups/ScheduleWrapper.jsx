import React, { Component } from "react";
import axios from "axios";
import DateAndTimePicker from "../Utils/DateAndTimePicker";
import Poll from "../Utils/Poll";
import "../styles/scheduleWrapperStyle.css";

export default class ScheduleWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDateAndTimePickers: props.group.isAdmin && !props.group.survey,
      pollSucceedMsgToAdmin: props.group.isAdmin && props.group.survey,
    };
    this.createPoll = this.createPoll.bind(this);
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
    debugger;

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
          debugger;
          this.setState({
            showDateAndTimePickers: false,
            pollSucceedMsgToAdmin: true,
          });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  getComponent = () => {
    const { showDateAndTimePickers, pollSucceedMsgToAdmin } = this.state;
    let component;
    debugger;
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
        <Poll survey={this.props.group.survey} groupId={this.props.group._id} />
      );
    }
    return component;
  };

  render() {
    return this.getComponent();
  }
}
