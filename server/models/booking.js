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
    participants: {
      type: [
        {
          firstName: { type: String, required: true },
          lastName: { type: String, required: true },
          age: { type: Number, required: true, min: 0 },
          type: { type: String, enum: ["adult", "child", "cojoint"], default: "adult" },
        },
      ],
      default: [],
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
