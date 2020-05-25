import React, { Component } from "react";
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5500');

const jwt = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYTk0Y2MxZThlNmFlMDVhMGE3Mjk5NCIsIm5hbWUiOiJJdGFpIEZhcmJlciIsImlhdCI6MTU5MDM5OTM5NywiZXhwIjoxNTkwNDIwOTk3fQ.FMNrntOF84UTPHc9lVCcJE0dsk1qoxCwwQ2DPKWAi5U'; //get jwt from somewhere

export default class Header extends Component {
    componentDidMount() {
        socket.emit('new-user', {jwt});
      }
    
      componentWillUnmount(){
        socket.emit('disconnect');
        socket.disconnect(true);
      }
      render(){
          return null;
      }
}