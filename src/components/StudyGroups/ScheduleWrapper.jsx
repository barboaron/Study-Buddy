import React, { Component } from "react";
import axios from "axios";
import DateAndTimePicker from "../Utils/DateAndTimePicker";
import "../styles/studyGroupStyles.css";

export default class ScheduleWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDateAndTimePickers: props.isAdmin,
    };
  }

  render() {
    const { showDateAndTimePickers } = this.state;

    return showDateAndTimePickers ? (
      <form className="picker_Form" onSubmit={this.addNewStudyGroup}>
        <DateAndTimePicker />
        <button className="picker_submitBtn" type="submit">
          Submit
        </button>
      </form>
    ) : null;
  }
}
