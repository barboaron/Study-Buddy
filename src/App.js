import React from "react";
import LoginPage from "./components/Login/LoginPage";
import MainPage from "./components/Main/MainPage";
import RegistrationPage from "./components/Registration/RegistrationPage";
import UserProfile from "./components/UserProfile/UserProfile";
import StudyGroupCreation from "./components/StudyGroups/StudyGroupCreation";
import GroupPage from "./components/StudyGroups/GroupPage";
import MyGroups from "./components/StudyGroups/MyGroups";
import Forums from "./components/Forums/Forums";
import ForumPage from "./components/Forums/ForumPage";
// import { Header } from "./components/Header";
import Admin from "./components/AdminPanel/Admin";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "semantic-ui-css/semantic.min.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/login" component={LoginPage}></Route>
          <Route exact path="/" component={MainPage}></Route>
          <Route path="/registration" component={RegistrationPage}></Route>
          <Route path="/UserProfile" component={UserProfile}></Route>
          <Route path="/GroupPage" component={GroupPage}></Route>
          <Route path="/MyGroups" component={MyGroups}></Route>
          <Route path="/Forums" component={Forums}></Route>
          <Route path="/ForumPage" component={ForumPage}></Route>
          <Route
            path="/StudyGroupCreation"
            component={StudyGroupCreation}
          ></Route>
          <Route path="/Admin" component={Admin}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
