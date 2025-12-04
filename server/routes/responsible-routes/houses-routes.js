const express = require("express");
const {
  addNewHouse,
  getAllHouses,
  updateHouseByID,
  getHouseDetailsByID,
  DeleteHouseById
} = require("../../controllers/responsible-controller/houses-controller");
const router = express.Router();
const uploadMultipleImages = require("../../middleware/uploadMultipleImagesMiddleware");
const authenticate = require("../../middleware/auth-middleware");
const { authorizeResponsible } = require("../../middleware/authorization-middleware");

// Public routes
router.get("/getAll", getAllHouses);
router.get("/get/details/:id", getHouseDetailsByID);

// Protected routes - require authentication and responsable role
router.post("/add", authenticate, authorizeResponsible, uploadMultipleImages, addNewHouse);
router.put("/update/:id", authenticate, authorizeResponsible, uploadMultipleImages, updateHouseByID);
router.delete("/delete/:id", authenticate, authorizeResponsible, DeleteHouseById);

module.exports = router;
