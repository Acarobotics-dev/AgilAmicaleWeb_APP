const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const House = require("../models/House");
const Booking = require("../models/booking");
const EventModel = require("../models/Events");
const ContactMessage = require("../models/Contact");

let userCounter = 0;

/** Four-digit matricule unique enough for sequential tests */
function uniqueMatricule() {
  userCounter += 1;
  const v = (((Date.now() % 8999) + userCounter + 2345) % 9000) + 1000;
  return String(v);
}

async function seedUser(attrs = {}) {
  const pwd = attrs.passwordPlain ?? "Testpass1";
  const email = attrs.userEmail ?? `user_${Date.now()}_${userCounter++}@test.local`;

  const user = await User.create({
    firstName: attrs.firstName ?? "Jean",
    lastName: attrs.lastName ?? "Test",
    userEmail: email,
    matricule: attrs.matricule ?? uniqueMatricule(),
    password: await bcrypt.hash(pwd, 4),
    role: attrs.role ?? "adherent",
    status: attrs.status ?? "Approuvé",
  });
  user.passwordPlain = pwd;
  return user;
}

function signUserToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign(
    {
      _id: user._id.toString(),
      userEmail: user.userEmail,
      role: user.role,
      status: user.status,
    },
    secret,
    { expiresIn: "1h" }
  );
}

async function seedHouse(attrs = {}) {
  const priceStart = attrs.priceStart ?? new Date("2030-01-01");
  const priceEnd = attrs.priceEnd ?? new Date("2030-02-01");

  const doc = {
    title: attrs.title ?? "Maison test",
    address: attrs.address ?? "Rue 1",
    description: attrs.description ?? "Une belle maison.",
    location: attrs.location ?? "Paris",
    price: [
      {
        week: { startdate: priceStart, endDate: priceEnd },
        price: attrs.weekPrice ?? 100,
      },
    ],
    numberOfRooms: attrs.numberOfRooms ?? 2,
    numberOfBathrooms: attrs.numberOfBathrooms ?? 1,
    unavailableDates: attrs.unavailableDates ?? [],
  };

  return House.create(doc);
}

/** Activité discriminator */
async function seedEvent(attrs = {}) {
  const startDate = attrs.startDate ?? new Date("2035-06-01T00:00:00.000Z");
  const endDate = attrs.endDate ?? new Date("2035-06-07T00:00:00.000Z");

  const Disc = EventModel.discriminators["Activité"];
  const doc = await Disc.create({
    title: attrs.title ?? "Activité test",
    type: "Activité",
    description: attrs.description ?? "Description test event.",
    startDate,
    endDate,
    basePrice: attrs.basePrice ?? 50,
    sportType: attrs.sportType ?? "Fitness",
    durationMinutes: attrs.durationMinutes ?? "60",
    location: attrs.location ?? "Hall",
    maxParticipants: attrs.maxParticipants,
    currentParticipants: attrs.currentParticipants ?? 0,
  });
  return doc;
}

async function clearCollections() {
  const cols = mongoose.connection.collections;
  await Promise.all(
    Object.keys(cols).map((key) => cols[key].deleteMany({}).catch(() => {}))
  );
}

module.exports = {
  seedUser,
  signUserToken,
  seedHouse,
  seedEvent,
  clearCollections,
  models: {
    User,
    House,
    Booking,
    Event: EventModel,
    ContactMessage,
  },
};
