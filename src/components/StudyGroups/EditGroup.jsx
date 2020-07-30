import React, { Component } from "react";
import FloatingLabel from "../Utils/floatingLabel";
import axios from "axios";
import "../styles/studyGroupStyles.css";

export default class StudyGroupCreation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.updateStudyGroup = this.updateStudyGroup.bind(this);
  }

  async updateStudyGroup(event) {
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
              showGroupUpdatedMsg: true,
              errNotFilledCourseOrType: false,
            });
          }
        })
        .catch((err) => {
          console.log("error");
        });
    }
  }

  backToMyGroups = () => {
    this.props.hideEditGroup();
  };

  render() {
    const { showGroupUpdatedMsg } = this.state;
    const { groupForEdit } = this.props;

    return (
      <>
        <div className="profile-head">
          <h2>Edit Study Group</h2>
        </div>

        {showGroupUpdatedMsg ? (
          <div>
            <span className="msgSuccess">
              Study group updated successfully!
              <br />
            </span>
            <br />
          </div>
        ) : (
          <form
            className="EditStudyGroup_Form"
            onSubmit={this.updateStudyGroup}
          >
            <FloatingLabel
              defaultValue={groupForEdit.groupName}
              placeholder="Group Name"
              type="text"
              name="groupName"
              content="Group Name:"
              isRequired
            />
            <FloatingLabel
              type="number"
              name="maxParticipants"
              content="Maximum Participants:"
              defaultValue={groupForEdit.maxParticipants}
              minVal="2"
              maxVal="10"
            />
            <textarea
              id="descriptionInput"
              rows="4"
              cols="50"
              placeholder="Describe the group's purpose..."
            >
              {groupForEdit.description}
            </textarea>
            <div className="floating-label">
              <input
                className="input"
                type="datetime-local"
                name="date"
                value={groupForEdit.dateAndTime}
              />
              <label htmlFor="date">When:</label>
            </div>
            <div>
              <button className="BackBtn" onClick={this.backToMyGroups}>
                Back
              </button>
              <button className="updateGroup_Btn" type="submit">
                Update
              </button>
            </div>
          </form>
        )}
      </>
    );
  }
}
