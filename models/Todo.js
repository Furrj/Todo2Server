const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: String,
  text: String,
});

mongoose.model("Todo", todoSchema);
