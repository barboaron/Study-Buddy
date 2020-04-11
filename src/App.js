import React from "react";
import LoginPage from "./components/LoginPage";
import MainPage from "./components/MainPage";
import RegistrationPage from "./components/RegistrationPage";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation,
} from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/login" component={LoginPage}></Route>
          <Route exact path="/" component={MainPage}></Route>
          <Route path="/registration" component={RegistrationPage}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
