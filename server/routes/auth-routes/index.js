const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  registerUser,
  loginUser,
  GetUserbyID,
  updateUserByID,
  updateUserPassword,
  DeleteUserById,
  getAllUsers,
  updateUserStatus,
  forgotPassword,
  AddUserByAdmin,
  resetPassword,
  getUserBookingHistory,
} = require("../../controllers/auth-controller/index");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const { authorizeResponsible, authorizeUserModification, requireApprovedStatus } = require("../../middleware/authorization-middleware");
const router = express.Router();

// Rate limiters for sensitive authentication operations
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Trop de tentatives, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Trop de requêtes, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes with rate limiting
router.post("/register", generalAuthLimiter, registerUser);
router.post("/login", strictAuthLimiter, loginUser);
router.post("/forgot-password", strictAuthLimiter, forgotPassword);
router.post("/reset-password", strictAuthLimiter, resetPassword);

// Protected routes - require authentication
router.get("/check-auth", authenticateMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: { user },
  });
});

router.get("/get/:id", authenticateMiddleware, GetUserbyID);
router.get("/bookingHistory/:id", authenticateMiddleware, requireApprovedStatus, getUserBookingHistory);

// User modification routes - user can modify their own data, responsable can modify any
router.put("/update/:id", authenticateMiddleware, authorizeUserModification, updateUserByID);
router.put("/updatePassword/:id", authenticateMiddleware, authorizeUserModification, updateUserPassword);

// Admin/Responsable-only routes
router.post("/AddUser", authenticateMiddleware, authorizeResponsible, AddUserByAdmin);
router.post("/updatStatus/:id", authenticateMiddleware, authorizeResponsible, updateUserStatus);
router.get("/getAllUsers", authenticateMiddleware, authorizeResponsible, getAllUsers);
router.delete("/DeleteUser/:id", authenticateMiddleware, authorizeResponsible, DeleteUserById);

module.exports = router;
