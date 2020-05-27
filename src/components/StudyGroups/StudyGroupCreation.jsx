import React, { Component } from "react";
import FloatingLabel from "../Utils/floatingLabel";
import axios from "axios";
import DropDownOptions from "../Utils/DropDownOptions";
import Questions from "./Questions";
import "../styles/studyGroupStyles.css";

export default class StudyGroupCreation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDateAndTime: false,
      showAddingQuestions: false,
      errNotFilledCourseOrType: false,
    };
    this.getGroupTypes = this.getGroupTypes.bind(this);
    this.getMyDeatils = this.getMyDeatils.bind(this);
    this.addNewStudyGroup = this.addNewStudyGroup.bind(this);
  }

  async componentDidMount() {
    const group_types = await this.getGroupTypes();
    const list = await this.getMyDeatils();
    const coursesList = {};
    list.map((element) => (coursesList[element.name] = element.id));

    this.setState({
      coursesList,
      possibleTypesForGroup: group_types,
      isLoading: true,
    });
  }

  async addNewStudyGroup(event) {
    event.persist();
    event.preventDefault();

    const { coursesList } = this.state;
    const groupName = event?.target?.elements?.groupName?.value;
    const courseName = event?.target?.elements?.courseName?.value;
    const courseId = coursesList[courseName];
    const groupType = event?.target?.elements?.groupType?.value;
    if (courseName === "" || groupType === "") {
      this.setState({ errNotFilledCourseOrType: true });
    } else {
      const description = event?.target?.elements?.descriptionInput?.value;
      const numberOfParticipants =
        event?.target?.elements?.maxParticipants?.value;
      const dateAndTime = new Date(event?.target?.elements?.date?.value);
      const question1 = event?.target?.elements?.Question1?.value;
      const question2 = event?.target?.elements?.Question2?.value;
      const question3 = event?.target?.elements?.Question3?.value;
      const question4 = event?.target?.elements?.Question4?.value;
      const question5 = event?.target?.elements?.Question5?.value;
      const questions = [];
      question1 && questions.push(question1);
      question2 && questions.push(question2);
      question3 && questions.push(question3);
      question4 && questions.push(question4);
      question5 && questions.push(question5);

      let token = await localStorage.getItem("jwtToken");
      const studyGroupDetails = {
        jwt: token,
        groupName,
        courseName,
        courseId,
        groupType,
        description,
        numberOfParticipants,
        dateAndTime,
        questions,
      };

      return axios
        .post("/api/studyGroups/create", studyGroupDetails)
        .then((res) => {
          if (res.status !== 200) {
            console.log("error");
          } else {
            this.setState({
              showGroupCreatedMsg: true,
              errNotFilledCourseOrType: false,
            });
          }
        })
        .catch((err) => {
          console.log("error");
        });
    }
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

  triggersShowDateAndTime = () => {
    const { showDateAndTime } = this.state;
    this.setState({ showDateAndTime: !showDateAndTime });
  };

  triggersShowAddingQuestions = () => {
    const { showAddingQuestions } = this.state;
    this.setState({ showAddingQuestions: !showAddingQuestions });
  };

  backToMainPage = () => {
    const { history } = this.props;
    history.push("/");
  };

  render() {
    const {
      possibleTypesForGroup,
      coursesList,
      showDateAndTime,
      showAddingQuestions,
      isLoading,
      showGroupCreatedMsg,
      errNotFilledCourseOrType,
    } = this.state;

    if (!isLoading) {
      return null;
    }

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

          {showGroupCreatedMsg ? (
            <div>
              <span className="msgSuccess">
                Study group created successfully!
                <br />
              </span>
              <br />
              <button className="BackBtn" onClick={this.backToMainPage}>
                Back To Main Page
              </button>
            </div>
          ) : (
            <form
              className="studyGroupCreation_Form"
              onSubmit={this.addNewStudyGroup}
            >
              <div id="i1" className="col1">
                <FloatingLabel
                  placeholder="Group Name"
                  type="text"
                  name="groupName"
                  content="Group Name:"
                  isRequired
                />
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
                  defaultValue="2"
                  minVal="2"
                  maxVal="10"
                />
                <textarea
                  id="descriptionInput"
                  rows="4"
                  cols="50"
                  placeholder="Describe the group's purpose..."
                  required
                />
              </div>
              <div id="i2" className="col2">
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
                      <input
                        className="input"
                        type="datetime-local"
                        name="date"
                      />
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
              </div>
              <button className="studyGroupCreation_Btn" type="submit">
                Create
              </button>
            </form>
          )}
          {errNotFilledCourseOrType && (
            <span className="errMsg">
              Course and Type of group are mandatory fields <br />
            </span>
          )}
        </div>
      </div>
    );
  }
}
