import React from "react";
import socketIOClient from "socket.io-client";
import MenuBar from "./Utils/MenuBar";

var socket;
class Header extends React.Component {
  constructor() {
    super();
    this.state = {
      endpoint: "http://localhost:5500/",
    };
  }

  componentDidMount() {
    let jwt = localStorage.getItem("jwtToken");
    console.log(jwt);
    socket = socketIOClient(this.state.endpoint);
    socket.emit("new-user", { jwt });
    socket.on("notification", (notification) => {
      alert(notification.senderName); // need to add notification to state or call a function that updates the notification
    });
  }
  render() {
    return <MenuBar />;
  }
}
export { Header, socket };
