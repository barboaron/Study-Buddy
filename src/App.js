import React from "react";
import LoginPage from "./components/Login/LoginPage";
import MainPage from "./components/MainPage";
import RegistrationPage from "./components/Registration/RegistrationPage";
import UserProfile from "./components/UserProfile/UserProfile";
import StudyGroupCreation from "./components/StudyGroups/StudyGroupCreation";
import Header from "./components/Header";
// import EditProfile from "./components/UserProfile/EditProfile";
import Admin from "./components/AdminPanel/Admin";
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
          <Route
            path="/StudyGroupCreation"
            component={StudyGroupCreation}
          ></Route>
          {/* <Route path="/EditProfile" component={EditProfile}></Route> */}
          <Route path="/Admin" component={Admin}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
