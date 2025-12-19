const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  updateStatusBooking, // Corrected function name
} = require("../../controllers/responsible-controller/booking-controller");
const authenticate = require("../../middleware/auth-middleware");
const { authorizeResponsible, requireApprovedStatus } = require("../../middleware/authorization-middleware");

// User can create their own booking (authenticated and approved)
router.post("/Add", authenticate, requireApprovedStatus, createBooking);

// Responsable-only routes
router.get("/getAll", authenticate, authorizeResponsible, getBookings);
router.put("/edit/:id", authenticate, authorizeResponsible, updateBooking);
router.put("/statuschange/:id", authenticate, authorizeResponsible, updateStatusBooking);
router.delete("/delete/:id", authenticate, authorizeResponsible, deleteBooking);

module.exports = router;
