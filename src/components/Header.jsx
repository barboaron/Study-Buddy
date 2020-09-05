import React from "react";
import socketIOClient from "socket.io-client";
import MenuBar from "./Utils/MenuBar";
import axios from "axios";

/* Header component is a wrapper component for the MenuBar- manages all the transmission of notifications using web socket*/
var socket;
class Header extends React.Component {
  constructor() {
    super();
    this.state = {
      endpoint: "http://localhost:5500/",
    };
    this.getAllNotifications = this.getAllNotifications.bind(this);
    this.updateSeenNotifications = this.updateSeenNotifications.bind(this);
  }

  componentDidMount() {
    let jwt = localStorage.getItem("jwtToken");
    socket = socketIOClient(this.state.endpoint);
    socket.emit("new-user", { jwt });
    socket.on("notification", (notification) => {
      this.getAllNotifications();
    });
    this.getAllNotifications();
  }

  async getAllNotifications() {
    let token = await localStorage.getItem("jwtToken");

    const getNotifications = {
      jwt: token,
    };

    return axios
      .post("/api/users/notifications", getNotifications)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          const { seenNotifications, unseenNotifications } = res.data;
          this.setState({
            seenNotifications,
            unseenNotifications,
            isLoading: true,
          });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  async updateSeenNotifications() {
    let token = await localStorage.getItem("jwtToken");

    const updateNotifications = {
      jwt: token,
    };

    return axios
      .post("/api/users/updateSeenNotifications", updateNotifications)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          const { seenNotifications, unseenNotifications } = res.data;
          this.setState({
            seenNotifications,
            unseenNotifications,
          });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }

  render() {
    const { seenNotifications, unseenNotifications, isLoading } = this.state;

    if (!isLoading) {
      return null;
    }

    return (
      <MenuBar
        seenNotifications={seenNotifications}
        unseenNotifications={unseenNotifications}
        updateSeenNotifications={this.updateSeenNotifications}
      />
    );
  }
}
export { Header, socket };
