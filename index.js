const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
//
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const session = require("express-session");
//

const keys = require("./config/keys");
const PORT = process.env.PORT || 5000;

mongoose.connect(keys.MONGO_URI);
require("./models/Todo");
require("./models/User");
const Todo = mongoose.model("Todo");
const User = mongoose.model("User");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 60 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(cookieParser(keys.SESSION_SECRET));

app.get("/api", async (req, res) => {
  const data = await Todo.find({});

  res.json(data);
});

app.post("/api", async (req, res) => {
  try {
    const newTodo = new Todo(req.body);
    const saved = await newTodo.save();
    res.json(saved);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.put("/api", async (req, res) => {
  const id = req.body.id;
  try {
    const sent = await Todo.findByIdAndUpdate(id, {
      title: req.body.title,
      text: req.body.text,
    });
    res.json(sent);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.delete("/api/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Todo.findByIdAndDelete(id);
    res.json(deleted);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.post("/login", (req, res) => {
  console.log(req.body);
  res.json("recieved");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const regCheck = await User.exists({ username: username });
    if (regCheck) {
      res.json("Taken");
      console.log("Taken");
    } else {
      const newUser = new User({
        username,
      });
      const regUser = await User.register(newUser, password);
      res.json("Registered");
      console.log(regUser);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
