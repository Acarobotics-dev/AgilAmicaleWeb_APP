const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    userPhone: {
      type: String,
    },

    matricule: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{4}$/, "Matricule must be exactly 4 digits"],
    },

    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "adherent",
      enum: ["adherent", "responsable"],
    },
    status: {
      type: String,
      default: "En Attente",
      enum: ["En Attente", "Approuvé", "Refusé"],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    BookingHistory: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking",
        },
      
      },
    ],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
