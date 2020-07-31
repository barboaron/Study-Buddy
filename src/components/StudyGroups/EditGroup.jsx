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
    const { groupForEdit } = this.props;
    event.persist();
    event.preventDefault();

    const groupName = event?.target?.elements?.groupName?.value;
    const description = event?.target?.elements?.descriptionInput?.value;
    const maxParticipants = event?.target?.elements?.maxParticipants?.value;
    const date = new Date(event?.target?.elements?.date?.value);

    let token = await localStorage.getItem("jwtToken");
    const studyGroupDetailsUpdate = {
      jwt: token,
      groupId: groupForEdit._id,
      updateData: {
        groupName,
        description,
        maxParticipants,
        date,
      },
    };

    return axios
      .post("/api/studyGroups/updateGroup", studyGroupDetailsUpdate)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.setState({ showGroupUpdatedMsg: true });
          this.props.updateGroupsList(res.data.studyGroups);
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  backToMyGroups = () => {
    this.props.hideEditGroup();
  };

  fixDateString = (string, subString, index) => {
    const idx = string.split(subString, index).join(subString).length;
    return string.substring(0, idx);
  };

  getMinParticipants = () => {
    const { participants } = this.props.groupForEdit;
    return participants.length === 1 ? 2 : participants.length;
  };

  render() {
    const { showGroupUpdatedMsg } = this.state;
    const { groupForEdit } = this.props;
    const date = groupForEdit.date
      ? this.fixDateString(groupForEdit.date, ":", 2)
      : null;
    const minParticipants = this.getMinParticipants();

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
            <button className="BackBtn" onClick={this.backToMyGroups}>
              Back
            </button>
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
              content={`Maximum Participants: (Minimum ${minParticipants})`}
              defaultValue={groupForEdit.maxParticipants}
              minVal={minParticipants}
              maxVal="10"
            />
            <textarea
              id="descriptionInput"
              rows="4"
              cols="50"
              placeholder="Describe the group's purpose..."
              defaultValue={groupForEdit.description}
            />
            <div className="floating-label">
              <input
                className="input"
                type="datetime-local"
                name="date"
                value={date}
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
