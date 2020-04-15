import React from "react";
import LoginPage from "./components/LoginPage";
import MainPage from "./components/MainPage";
import RegistrationPage from "./components/RegistrationPage";
import UserProfile from "./components/UserProfile";
import EditProfile from "./components/EditProfile";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/login" component={LoginPage}></Route>
          <Route exact path="/" component={MainPage}></Route>
          <Route path="/registration" component={RegistrationPage}></Route>
          <Route path="/UserProfile" component={UserProfile}></Route>
          <Route path="/EditProfile" component={EditProfile}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
