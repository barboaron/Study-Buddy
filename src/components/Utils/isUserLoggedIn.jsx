import axios from "axios";

/* isUserLoggedIn function is a util function that check if the user logged in, if not- transfers the user to the login page*/
export async function isUserLoggedIn(
  history,
  loggedIn_path,
  not_loggedIn_path
) {
  let token = await localStorage.getItem("jwtToken");
  if (token !== null) {
    const reqData = {
      jwt: token,
    };

    return axios
      .post("/api/users/isLoggedIn", reqData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
          return false;
        } else {
          if (res.data.isLoggedIn) {
            history.push(loggedIn_path);
            return true;
          }
        }
      })
      .catch((err) => {
        console.log("error");
        return false;
      });
  } else {
    not_loggedIn_path && history.push(not_loggedIn_path);
    return false;
  }
}
