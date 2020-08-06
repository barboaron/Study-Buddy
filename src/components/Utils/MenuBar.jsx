import React, { Component } from "react";
import axios from "axios";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import NotificationsIcon from "../Icons/NotificationsIcon";
import Notification from "./Notification";
import Badge from "@material-ui/core/Badge";
import "../styles/menuStyles.css";

export default class MenuBar extends Component {
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

  handleJoinPopup = () => {
    this.togglePopup();
  };

  togglePopup = () => {
    this.setState({
      showPopup: !this.state.showPopup,
    });
  };

  toggleDropdown = () => {
    const { updateSeenNotifications } = this.props;
    this.isDropdownOpen && updateSeenNotifications();
    this.isDropdownOpen = !this.isDropdownOpen;
  };

  render() {
    const { isLoading, isAdmin } = this.state;
    const { seenNotifications, unseenNotifications } = this.props;
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
              {/* <NavDropdown title="Forums" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown> */}
            </Nav>
            <Nav>
              <NavDropdown
                title={notificationsWithBadge}
                id="collasible-nav-dropdown"
                alignRight
                onClick={this.toggleDropdown}
              >
                {unseenNotifications.reverse().map((elem, index) => {
                  return (
                    <>
                      <NavDropdown.Item
                        className="unseen"
                        href={
                          elem.type !== "join-request" ? "#action/3.1" : null
                        }
                        onClick={
                          elem.type === "join-request" && this.handleJoinPopup
                        }
                      >
                        <Notification notification={elem} />
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                    </>
                  );
                })}
                {seenNotifications.reverse().map((elem, index) => {
                  return (
                    <>
                      <NavDropdown.Item
                        className="seen"
                        href={
                          elem.type !== "join-request" ? "#action/3.1" : null
                        }
                        onClick={
                          elem.type === "join-request" && this.handleJoinPopup
                        }
                      >
                        <Notification notification={elem} />
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                    </>
                  );
                })}
              </NavDropdown>
              <Nav.Link href="/UserProfile">My Profile</Nav.Link>
              <Nav.Link href="#">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        {this.state.showPopup ? (
          <div className="popup">
            <div className="popup_inner">
              <button className="popupsBtn" onClick={this.togglePopup}>
                X Close Me
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  }
}
