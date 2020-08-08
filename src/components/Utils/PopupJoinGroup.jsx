import React from "react";

class PopupJoinGroup extends React.Component {
  render() {
    const { togglePopup, handleAccept } = this.props;

    return (
      <div className="popup">
        <div className="popup_inner">
          <button className="popupsBtn" onClick={togglePopup}>
            X Close Me
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
