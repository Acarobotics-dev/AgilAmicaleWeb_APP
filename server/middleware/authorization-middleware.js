// Middleware to check if user is a responsable or admin
const authorizeResponsible = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  if (req.user.role !== "responsable") {
    return res.status(403).json({
      success: false,
      message: "Access denied. This resource requires responsable role.",
    });
  }

  next();
};

// Middleware to check if user status is approved
const requireApprovedStatus = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  if (req.user.status !== "Approuvé") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Your account is not approved.",
    });
  }

  next();
};

// Middleware to check if user can modify a specific user resource
// Regular users can only modify their own data, responsable can modify any
const authorizeUserModification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  // Responsable can modify any user
  if (req.user.role === "responsable") {
    return next();
  }

  // Regular user can only modify their own data - compare as strings
  if (targetUserId.toString() !== currentUserId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only modify your own data.",
    });
  }

  next();
};

module.exports = {
  authorizeResponsible,
  requireApprovedStatus,
  authorizeUserModification,
};
