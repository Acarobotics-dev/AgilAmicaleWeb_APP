const mongoose = require("mongoose");


const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "activityModel"
    },
    activityCategory: {
      type: String,
      enum: ["Sejour Maison", "Voyage", "Excursion", "Club", "Évènement", "Activité"],
      default: "Sejour Maison",
    },
    activityModel: {
      type: String,
      required: true,
      enum: ["House", "Event"],
    },
    bookingPeriod: {
      type: { start: Date, end: Date },
    },
    status: {
      type: String,
      enum: ["en attente", "confirmé", "annulé", "terminé"],
      default: "en attente",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", BookingSchema);
