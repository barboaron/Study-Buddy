import React, { Component } from "react";
import axios from "axios";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import NotificationsIcon from "../Icons/NotificationsIcon";
import Notification from "./Notification";
import PopupJoinGroup from "./PopupJoinGroup";
import Badge from "@material-ui/core/Badge";
import { socket } from "./../Header";
import { withRouter } from "react-router";
import "../styles/menuStyles.css";

/* MenuBar component renders the main menu in the header of the application(you can access the menu from anywhere in the application)*/
class MenuBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.isAdmin = this.isAdmin.bind(this);
  }

  async componentDidMount() {
    const isAdmin = await this.isAdmin();
    this.setState({ isAdmin, isLoading: true });
  }

  async isAdmin() {
    let token = await localStorage.getItem("jwtToken");
    if (token !== null) {
      const reqData = {
        jwt: token,
      };

      return axios
        .post("/api/users/isAdmin", reqData)
        .then((res) => {
          if (res.status !== 200) {
            return false;
          } else {
            return res.data.isAdmin;
          }
        })
        .catch((err) => {
          return false;
        });
    } else {
      return false;
    }
  }

  handleJoinPopup = (elem) => {
    this.togglePopup(elem);
  };

  togglePopup = (elem) => {
    this.setState({
      showPopup: !this.state.showPopup,
      notificationInPopup: elem,
    });
  };

  handleAccept = () => {
    let jwt = localStorage.getItem("jwtToken");
    socket.emit("join-group-approved", {
      jwt,
      group: this.state.notificationInPopup.group,
      approvedUserId: this.state.notificationInPopup.senderId,
      notificationId: this.state.notificationInPopup.timeCreated,
    });
    this.togglePopup(null);
  };

  
  handleIgnore = () => {
    let jwt = localStorage.getItem("jwtToken");
    socket.emit("join-group-ignored", {
      jwt,
      group: this.state.notificationInPopup.group,
      ignoredUserId: this.state.notificationInPopup.senderId,
    });
    this.togglePopup(null);
  };

  toggleDropdown = () => {
    const { updateSeenNotifications } = this.props;
    this.isDropdownOpen && updateSeenNotifications();
    this.isDropdownOpen = !this.isDropdownOpen;
  };

  getDropdownElements = (notifications, className) => {
    console.log(notifications);
    return notifications
      .reverse()
      .map((elem) => (
        <Notification
          notification={elem}
          className={className}
          handleJoinPopup={this.handleJoinPopup}
        />
      ));
  };

  getNotificationsDropdown = () => {
    const { seenNotifications, unseenNotifications } = this.props;
    return (
      <>
        {this.getDropdownElements(unseenNotifications, "unseen")}
        {this.getDropdownElements(seenNotifications, "seen")}
      </>
    );
  };

  logoutUser = () => {
    localStorage.removeItem("jwtToken");
    this.props.history.push("/login");
  };

  render() {
    const { isLoading, isAdmin, notificationInPopup } = this.state;
    const { unseenNotifications } = this.props;
    const notificationsWithBadge = (
      <Badge color="secondary" badgeContent={unseenNotifications.length}>
        <NotificationsIcon />
      </Badge>
    );
    if (!isLoading) {
      return null;
    }

    return (
      <>
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
          <Navbar.Brand href="/">
            <img
              className="menuLogo"
              src="logoStudyBuddy_Horizontal.png"
              alt="Study-Buddy"
            />
          </Navbar.Brand>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/StudyGroupCreation">Create Study Group</Nav.Link>
              <Nav.Link href="/MyGroups">My Groups</Nav.Link>
              {isAdmin ? <Nav.Link href="/Admin">Admin</Nav.Link> : null}
              <Nav.Link href="/Forums">Forums</Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown
                title={notificationsWithBadge}
                id="collasible-nav-dropdown"
                alignRight
                onClick={this.toggleDropdown}
              >
                {this.getNotificationsDropdown()}
              </NavDropdown>
              <Nav.Link href="/UserProfile">My Profile</Nav.Link>
              <Nav.Link onClick={this.logoutUser}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        {this.state.showPopup ? (
          <PopupJoinGroup
            togglePopup={this.togglePopup}
            handleAccept={this.handleAccept}
            handleIgnore={this.handleIgnore}
            notificationInPopup={notificationInPopup}
          />
        ) : null}
      </>
    );
  }
}
export default withRouter(MenuBar);
