const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  logo: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true,
  },
});
  module.exports = mongoose.model("Hotel", HotelSchema);
