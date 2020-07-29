// import React, { Component } from "react";
// import openSocket from 'socket.io-client';
// const socket = openSocket('http://localhost:5500');

// const jwt = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYTk0Y2MxZThlNmFlMDVhMGE3Mjk5NCIsIm5hbWUiOiJJdGFpIEZhcmJlciIsImlhdCI6MTU5MDM5OTM5NywiZXhwIjoxNTkwNDIwOTk3fQ.FMNrntOF84UTPHc9lVCcJE0dsk1qoxCwwQ2DPKWAi5U'; //get jwt from somewhere

// export default class Header extends Component {
//     componentDidMount() {
//         socket.emit('new-user', {jwt});
//       }
    
//       componentWillUnmount(){
//         socket.emit('disconnect');
//         socket.disconnect(true);
//       }
//       render(){
//           return null;
//       }
// }

import React, { Component } from "react";
import socketIOClient from "socket.io-client";

var socket;
class Header extends React.Component {
  constructor() {
    super();
    this.state = {
      endpoint: 'http://localhost:5500/',
    };
  }

  componentDidMount() {
    let jwt = localStorage.getItem('jwtToken');
    console.log(jwt);
    socket = socketIOClient(this.state.endpoint);
    socket.emit('new-user', {jwt});
    socket.on('notification', notification => {
      alert(notification.senderName); // need to add notification to state or call a function that updates the notification
    });
  }
  render() {
      return (
        <header>
          <div>header</div>
        </header>
      );
    }
}
export { Header, socket };