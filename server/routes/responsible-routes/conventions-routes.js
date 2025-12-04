const express = require("express");
const router = express.Router();
const {
  createConvention,
  getConventions,
  updateConvention,
  deleteConvention,
} = require("../../controllers/responsible-controller/conventions-controller");
const uploadFileImage = require('../../middleware/uploadFileImageMiddleware');
const authenticate = require("../../middleware/auth-middleware");
const { authorizeResponsible } = require("../../middleware/authorization-middleware");

// Public routes
router.get("/getAll", getConventions);

// Protected routes - require authentication and responsable role
router.post("/AddConvention", authenticate, authorizeResponsible, uploadFileImage, createConvention);
router.put("/edit/:id", authenticate, authorizeResponsible, uploadFileImage, updateConvention);
router.delete("/delete/:id", authenticate, authorizeResponsible, deleteConvention);

module.exports = router;