/**
 * One-time migration: rebuild unavailableDates for every house
 * based solely on confirmed bookings.
 *
 * Run once in production:
 *   node server/scripts/fix-unavailable-dates.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const House = require("../models/House");
const Booking = require("../models/booking");

const getDatesInRangeExclEnd = (startDate, endDate) => {
  const dates = [];
  let current = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end   = new Date(Date.UTC(endDate.getUTCFullYear(),   endDate.getUTCMonth(),   endDate.getUTCDate()));
  while (current < end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const houses = await House.find({}, "_id title");
  console.log(`Found ${houses.length} house(s)`);

  for (const house of houses) {
    // All confirmed bookings for this house
    const confirmedBookings = await Booking.find({
      activity: house._id,
      activityCategory: "Sejour Maison",
      status: "confirmé",
      "bookingPeriod.start": { $exists: true },
      "bookingPeriod.end":   { $exists: true },
    });

    // Rebuild date list from confirmed bookings only
    const today = new Date().toISOString().split("T")[0];
    const newDates = [];

    for (const b of confirmedBookings) {
      const dates = getDatesInRangeExclEnd(
        new Date(b.bookingPeriod.start),
        new Date(b.bookingPeriod.end)
      );
      // Only keep future/current dates
      for (const d of dates) {
        if (d >= today && !newDates.includes(d)) newDates.push(d);
      }
    }

    newDates.sort();

    await House.findByIdAndUpdate(house._id, { $set: { unavailableDates: newDates } });
    console.log(`  [${house.title}] → ${newDates.length} unavailable date(s) (from ${confirmedBookings.length} confirmed booking(s))`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
