const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./src/routes/api/users");
const profiles = require("./src/routes/api/profiles");
const courses = require("./src/routes/api/courses");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const User = require("./src/models/User");
const keys = require("./config/keys");
//const multer = require('multer');

const app = express();
// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: false }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

  // Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);
app.use("/api/profiles", profiles);
app.use("/api/courses", courses);


app.get("/confirmation/:token", async (req, res) => { 
  try {
    const user = jwt_decode(req.params.token);
    const id = user.id;
    await User.update({_id: id}, {confirmed:true});
  }
  catch(err){
    console.log(err);
  }
  return res.redirect("http://localhost:3000");
}
);

// app.use(multer({ dest: "./uploads/",
//   rename: function (fieldname, filename) {
//     return filename;
//   },
//  }));

const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));