const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const cors = require("cors");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/exercise-track", {
  useNewUrlParser: true
});

// Database

const personSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  duration: Number,
  description: {
    type: String
  },
  date: {
    type: Date,
    default: new Date()
  }
});

let Person = mongoose.model("personSchema", personSchema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Not found middleware
// app.use((req, res, next) => {
//   return next({ status: 404, message: "not found" });
// });

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

// post user

app.post("/api/exercise/new-user", async (req, res) => {
  const checkUser = await Person.findOne({
    username: req.body.username
  }).exec();
  if (checkUser === null) {
    // res.send("username is already taken");
    const newUser = await Person.create({ username: req.body.username });
    res.send(newUser);
  } else {
    res.send("username is already taken");
  }
});

app.post("/api/exercise/add", async (req, res) => {
  console.log(req);
  const user = await Person.findByIdAndUpdate(req.body.userId, req.body, {
    new: true
  });
  if (user === null) {
    res.send("no username with that id exists");
  } else {
    res.send(user);
  }
});

// get all users

app.get("/api/exercise/users", async (req, res) => {
  const allUsers = await Person.find({});
  res.send(allUsers);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
