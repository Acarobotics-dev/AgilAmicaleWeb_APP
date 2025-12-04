const express = require("express");
const router = express.Router();
const {
  createHotel,
  getHotels,
  updateHotel,
  deleteHotel,
} = require("../../controllers/responsible-controller/hotels-controller");
const uploadSingleImage = require("../../middleware/uploadSingleImageMiddleware");
const authenticate = require("../../middleware/auth-middleware");
const { authorizeResponsible } = require("../../middleware/authorization-middleware");

// Public routes
router.get("/getAllHotels", getHotels);

// Protected routes - require authentication and responsable role
router.post("/AddHotel", authenticate, authorizeResponsible, uploadSingleImage, createHotel);
router.put("/edit/:id", authenticate, authorizeResponsible, uploadSingleImage, updateHotel);
router.delete("/delete/:id", authenticate, authorizeResponsible, deleteHotel);

module.exports = router;
