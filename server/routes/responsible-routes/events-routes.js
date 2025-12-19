const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} = require("../../controllers/responsible-controller/events-controller");
const uploadMultipleImages = require("../../middleware/uploadMultipleImagesMiddleware");
const authenticate = require("../../middleware/auth-middleware");
const { authorizeResponsible } = require("../../middleware/authorization-middleware");

// Public routes
router.get("/getAll", getEvents);

// Protected routes - require authentication and responsable role
router.post("/AddEvents", authenticate, authorizeResponsible, uploadMultipleImages, createEvent);
router.put("/edit/:id", authenticate, authorizeResponsible, uploadMultipleImages, updateEvent);
router.delete("/delete/:id", authenticate, authorizeResponsible, deleteEvent);

module.exports = router;