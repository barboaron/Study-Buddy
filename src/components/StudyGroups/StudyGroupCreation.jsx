import React, { Component } from "react";
import FloatingLabel from "../Utils/floatingLabel";
import axios from "axios";
import DropDownOptions from "../Utils/DropDownOptions";
import Questions from "./Questions";
import "../styles/studyGroupStyles.css";

export default class StudyGroupCreation extends Component {
  constructor(props) {
    super(props);
    this.state = { showDateAndTime: false, showAddingQuestions: false };
  }
  async addNewStudyGroup(event) {
    event.preventDefault();
    const course = event?.target?.elements?.course?.value;
    const groupType = event?.target?.elements?.groupType?.value;
    const description = event?.target?.elements?.description?.value;
    const numberOfParticipants =
      event?.target?.elements?.numberOfParticipants?.value;
    const dateAndTime = event?.target?.elements?.dateandTime?.value;
    const question1 = event?.target?.elements?.question1?.value;
    const question2 = event?.target?.elements?.question2?.value;
    const question3 = event?.target?.elements?.question3?.value;
    const question4 = event?.target?.elements?.question4?.value;
    const question5 = event?.target?.elements?.question5?.value;
    const questions = [];
    question1 && questions.push(question1);
    question2 && questions.push(question2);
    question3 && questions.push(question3);
    question4 && questions.push(question4);
    question5 && questions.push(question5);


    let token = await localStorage.getItem("jwtToken");

    const studyGroupDetails = {
      jwt: token,
      course: course,
      groupType: groupType,
      description: description,
      numberOfParticipants: numberOfParticipants,
      dateAndTime: dateAndTime,
      questions,
    };

    return axios
      .post("/api/studygroups", studyGroupDetails) //change the api path
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          //success
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async getMyDeatils() {
    let token = await localStorage.getItem("jwtToken");
    const reqData = {
      jwt: token,
    };

    return axios
      .post("/api/users/getMyDeatils", reqData) //change the api path
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

  async getGroupTypes() {
    let token = await localStorage.getItem("jwtToken");
    const reqData = {
      jwt: token,
    };

    return axios
      .post("/api/studygroups/getGroupTypes", reqData) //change the api path
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

  triggersShowDateAndTime = () => {
    const { showDateAndTime } = this.state;
    this.setState({ showDateAndTime: !showDateAndTime });
  };

  triggersShowAddingQuestions = () => {
    const { showAddingQuestions } = this.state;
    this.setState({ showAddingQuestions: !showAddingQuestions });
  };
  render() {
    const {
      possibleTypesForGroup,
      userDetails,
      showDateAndTime,
      showAddingQuestions,
    } = this.state;
    // const { userDetails, toggleEditProfile } = this.props;
    const list = ["11", "111", "1111"];

    return (
      <div className="profile_user">
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile">
          <div className="profile-head">
            <h2>Create Study Group</h2>
          </div>
          <form className="studyGroupCreation_Form" onSubmit={this.editProfile}>
            <DropDownOptions
              options={userDetails?.coursesList || list}
              label_name="Course:"
              selected="Choose Course..."
            />
            <DropDownOptions
              options={possibleTypesForGroup}
              label_name="Type Of Group:"
              selected="Choose Course..."
            />
            <textarea
              id="descriptionInput"
              rows="4"
              cols="50"
              placeholder="Describe the group's purpose..."
            />
            <FloatingLabel
              type="number"
              name="maxParticipants"
              content="Maximum Participants:"
              defaultValue="2"
              minVal="2"
              maxVal="10"
            />
            <div>
              <input
                className="Checkbox"
                type="checkbox"
                name="dateCheckBox"
                checked={showDateAndTime}
                onChange={this.triggersShowDateAndTime}
              />
              <label className="CheckboxLabel" htmlFor="dateCheckBox">
                Pick time and date
              </label>
              {showDateAndTime && (
                <div className="floating-label">
                  <input className="input" type="datetime-local" name="date" />
                  <label htmlFor="date">When:</label>
                </div>
              )}
            </div>

            <div className="addQuestions">
              <input
                className="Checkbox"
                type="checkbox"
                name="questionsCheckBox"
                checked={showAddingQuestions}
                onChange={this.triggersShowAddingQuestions}
              />
              <label className="CheckboxLabel" htmlFor="questionsCheckBox">
                Add questions
              </label>
              {showAddingQuestions && <Questions />}
            </div>
            <button className="studyGroupCreation_Btn" type="submit">
              Create
            </button>
          </form>
        </div>
      </div>
    );
  }
}
