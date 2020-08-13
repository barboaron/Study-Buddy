import React from "react";

class PopupJoinGroup extends React.Component {
  render() {
    const { notificationInPopup, handleAccept, togglePopup } = this.props;
    const { group } = notificationInPopup;

    return (
      <div className="popup">
        <div className="popup_inner">
          <h5 className="containerPopup_wrapper">
            <div className="containerPopup">
              {notificationInPopup.senderName} sent a join request to group
              {" " + group.groupName || group.courseName}
            </div>
            <div className="containerPopup">
              {notificationInPopup.questions.map((question, idx) => (
                <>
                  <span className={"questionAndAnswer"}> {question}: </span>
                  <span className={"questionAndAnswer"}>
                    {notificationInPopup.answers[idx]}
                  </span>
                  <br />
                </>
              ))}
            </div>
          </h5>
          <button className="popupsBtn" onClick={togglePopup}>
            X Close Me
          </button>
          <button className="popupsBtn" onClick={() => {}}>
            Ignore
          </button>
          <button className="popupsBtn" onClick={handleAccept}>
            Accept
          </button>
        </div>
      </div>
    );
  }
}
export default PopupJoinGroup;
