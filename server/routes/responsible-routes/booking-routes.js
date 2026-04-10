const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBooking,
  userUpdateBooking,
  deleteBooking,
  updateStatusBooking,
} = require("../../controllers/responsible-controller/booking-controller");
const authenticate = require("../../middleware/auth-middleware");
const { authorizeResponsible, requireApprovedStatus } = require("../../middleware/authorization-middleware");

// User can create their own booking (authenticated and approved)
router.post("/Add", authenticate, requireApprovedStatus, createBooking);

// User can edit their own pending booking
router.put("/userEdit/:id", authenticate, requireApprovedStatus, userUpdateBooking);

// Responsable-only routes
router.get("/getAll", authenticate, authorizeResponsible, getBookings);
router.put("/edit/:id", authenticate, authorizeResponsible, updateBooking);
router.put("/statuschange/:id", authenticate, authorizeResponsible, updateStatusBooking);
router.delete("/delete/:id", authenticate, authorizeResponsible, deleteBooking);

module.exports = router;
