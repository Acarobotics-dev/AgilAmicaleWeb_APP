const mongoose = require("mongoose");

const commonEventSchema = new mongoose.Schema({
  // Common fields for all event types
  title: {
    type: String,
    required: [true, "Le titre est obligatoire"],
    trim: true,
    maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"],
  },
  type: {
    type: String,
    required: true,
    enum: ["Voyage", "Excursion", "Club", "Évènement", "Activité"],
  },
  description: {
    type: String,
    required: [true, "La description est obligatoire"],
    maxlength: [2000, "La description ne peut pas dépasser 2000 caractères"],
  },
  images: {
    type: [String],
    default: [],
  },
  featuredPhoto: {
    type: String,
  },

  // Universal start and end dates for any event type
  startDate: { type: Date, required: [true, 'La date de début est obligatoire'] },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est obligatoire'],
    validate: {
      validator: function(value) {
        // allow validation only when startDate is set
        if (!this.startDate || !value) return true;
        return value >= this.startDate;
      },
      message: 'La date de fin doit être après la date de début'
    }
  },

  basePrice: {
      type: Number,
      required: [true, "Le prix est obligatoire"],
      min: [0, "Le prix ne peut pas être négatif"],
  },
  cojoinPresence:{
    type : Boolean,
    default : false
  },
  cojoinPrice: {
    type: Number,
    default: function () {
      return this.basePrice;
    },
  },
  childPresence :{
    type : Boolean ,
    default : false,
  },
  childPrice: {
    type: Number,
    default: function () {
      return this.basePrice;
    },
  },
  includes: {
    type: [String],
    default: [],
  },
  maxParticipants: {
    type: Number,
    min: 1,
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { discriminatorKey: 'type' });

// Specific schemas for each event type
const voyageSchema = new mongoose.Schema({
  // Voyage-specific fields
  destination: {
    type: String,
    trim: true,
  },
  departureCity: { type: String, required: true },
  transportType: { type: String, enum: ["Avion", "Bus", "Train", "Bateau"], required: true },
  accommodation: { type: String, required: true },
});

const excursionSchema = new mongoose.Schema({
  // Excursion-specific fields
    destination: {
    type: String,
    trim: true,
  },
  durationHours: { type: String, required: true },
  meetingPoint: { type: String, required: true },
  meetingTime: { type: String, required: true },
  equipmentRequired: [String]
});

const clubSchema = new mongoose.Schema({
  // Club-specific fields
  adresseclub: { type: String, required: true },

  schedule: [{
    day: { type: Date, required: true },
    time: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    }
  }],
  categoryclub: { type: String},
  ageGroup: { type: String, enum: ["Enfants", "Adolescents", "Adultes", "Tous"] }
});

const activiteSchema = new mongoose.Schema({
  // Activité-specific fields
  sportType: { type: String, required: true },
  durationMinutes: { type: String, required: true },
  location: { type: String, required: true },
  equipmentProvided: [String]
});

const evenementSchema = new mongoose.Schema({
  // Évènement-specific fields
  eventTime: { type: String, required: true },
  organizer: { type: String, required: true },
  location: { type: String, required: true },
  program: {
    type: [String],
    default: [],
  },
});

// Base Event model
const Event = mongoose.model("Event", commonEventSchema);

// Discriminators for each event type
Event.discriminator("Voyage", voyageSchema);
Event.discriminator("Excursion", excursionSchema);
Event.discriminator("Club", clubSchema);
Event.discriminator("Activité", activiteSchema);
Event.discriminator("Évènement", evenementSchema);

module.exports = Event;