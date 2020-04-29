import axios from "axios";

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
        } else {
          if (res.data.isLoggedIn) {
            history.push(loggedIn_path);
          }
        }
      })
      .catch((err) => {
        console.log("error");
      });
  } else {
    not_loggedIn_path && history.push(not_loggedIn_path);
  }
}
