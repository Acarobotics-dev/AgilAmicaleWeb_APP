const mongoose = require("mongoose");

const HouseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },

   price: [{
    week: {
      startdate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    price: { type: Number, required: true }
  }],

  numberOfRooms: { type: Number, required: true },
  numberOfBathrooms: { type: Number, required: true },

  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  isAvailable: { type: Boolean, required: true, default: true },

  // availablePeriod is derived from price array, so not strictly required
  availablePeriod: { type: [Date], default: [] },
  // Store unavailable dates as ISO date strings (YYYY-MM-DD) for consistency
  unavailableDates: { type: [String], default: [] },
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model("House", HouseSchema);
