import React, { Component } from "react";
import FloatingLabel from "../Utils/floatingLabel";
import axios from "axios";
import DropDownOptions from "../Utils/DropDownOptions";
import FilterIcon from "../Icons/FilterIcon";

import "../styles/studyGroupStyles.css";

export default class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.getGroupTypes = this.getGroupTypes.bind(this);
    this.getMyDeatils = this.getMyDeatils.bind(this);
  }

  async componentDidMount() {
    const group_types = await this.getGroupTypes();
    const list = await this.getMyDeatils();
    const coursesList = {};
    list.map((element) => (coursesList[element.name] = element.id));
    debugger;
    this.setState({
      coursesList,
      possibleTypesForGroup: group_types,
      isLoading: true,
    });
  }

  async getMyDeatils() {
    let token = await localStorage.getItem("jwtToken");
    const reqData = {
      jwt: token,
    };
    return axios
      .post("/api/profiles/profileByJWT", reqData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data.courses;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async getGroupTypes() {
    let token = await localStorage.getItem("jwtToken");
    const reqData = {
      jwt: token,
    };

    return axios
      .post("/api/studyGroups/types", reqData)
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

  render() {
    const { possibleTypesForGroup, coursesList, isLoading } = this.state;
    if (!isLoading) {
      return null;
    }
    return (
      <form className="filter_Form" onSubmit={this.props.onFilterBy}>
        <DropDownOptions
          options={Object.keys(coursesList)}
          label_name="Course:"
          name="courseName"
        />
        <DropDownOptions
          options={possibleTypesForGroup}
          label_name="Type Of Group:"
          name="groupType"
        />
        <FloatingLabel
          type="number"
          name="maxParticipants"
          content="Maximum Participants:"
          placeholder="Maximum Participants (2-10)"
          minVal="2"
          maxVal="10"
        />
        <div className="floating-label">
          <input className="input" type="datetime-local" name="date" />
          <label htmlFor="date">When (Date & Time):</label>
        </div>

        <button className="filter_Btn" type="submit">
          <FilterIcon />
        </button>
      </form>
    );
  }
}
