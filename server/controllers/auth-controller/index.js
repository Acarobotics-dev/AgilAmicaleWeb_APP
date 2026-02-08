const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail, sendStatusChangeEmail } = require("../../helpers/mailer")

// --- ERROR HANDLING ---
const ERROR_TYPES = {
  EMAIL_EXISTS: "EMAIL_ALREADY_EXISTS",
  MATRICULE_EXISTS: "MATRICULE_ALREADY_EXISTS",
  MISSING_PASSWORD: "MISSING_PASSWORD",
  MISSING_FIELDS: "MISSING_FIELDS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PASSWORD_MISMATCH: "PASSWORD_MISMATCH",
  SERVER_ERROR: "SERVER_ERROR",
  CAPTCHA_FAILED: "CAPTCHA_FAILED",
  NO_USERS_FOUND: "NO_USERS_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
};

const handleError = (res, type, message, status = 400) => {
  return res.status(status).json({ success: false, type, message });
};

const handleServerError = (res, error) => {
  console.error(error);
  return handleError(res, ERROR_TYPES.SERVER_ERROR, "Erreur interne du serveur", 500);
};

// --- USER VALIDATION ---
const checkExistingUser = async (userEmail, matricule, currentUserId = null) => {
  const query = {
    $or: [{ userEmail }, { matricule }],
    ...(currentUserId && { _id: { $ne: currentUserId } })
  };

  const existingUser = await User.findOne(query);
  if (!existingUser) return null;

  if (existingUser.userEmail === userEmail) {
    return { type: ERROR_TYPES.EMAIL_EXISTS, message: "Cet email est déjà utilisé." };
  }
  return { type: ERROR_TYPES.MATRICULE_EXISTS, message: "Ce matricule existe déjà." };
};

// --- PASSWORD MANAGEMENT ---
const validatePasswordStrength = (password) => {
  if (!password) {
    return { valid: false, message: "Le mot de passe est requis." };
  }

  if (password.length < 8) {
    return { valid: false, message: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: "Le mot de passe doit contenir au moins une lettre et un chiffre." };
  }

  return { valid: true };
};

const hashPassword = async (password) => {
  if (!password) throw new Error(ERROR_TYPES.MISSING_PASSWORD);
  return await bcrypt.hash(password, 10);
};



// --- CAPTCHA VERIFICATION ---
const verifyCaptcha = async (token) => {
  const response = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.HCAPTCHA_SECRET,
      response: token,
      sitekey: process.env.HCAPTCHA_SITEKEY
    })
  });

  return await response.json();
};

// --- CONTROLLERS ---
const registerUser = async (req, res, next) => {
  const { firstName, lastName, userEmail, userPhone, matricule, password, role, status } = req.body;

  try {
    // Check existing user
    const existingUserError = await checkExistingUser(userEmail, matricule);
    if (existingUserError) return handleError(res, existingUserError.type, existingUserError.message);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      userEmail,
      userPhone,
      matricule,
      password: await hashPassword(password),
      role,
      status,
    });

    await newUser.save();

    // Send welcome email and check result in production
    const emailResult = await sendEmail({
      to: userEmail,
      subject: "Bienvenue sur notre plateforme d'Amicale AGIL",
      text: `Bonjour ${firstName} ${lastName},\n\nVotre compte a été créé avec succès.\n\nMerci de patienter en attendant l'approbation de votre inscription par l'administrateur !\n\nCordialement,\nL'équipe de support.`
    });

    // In production, log if email failed to send
    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      console.error('Failed to send welcome email to new user:', {
        userId: newUser._id,
        email: userEmail,
        error: emailResult.error?.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès !"
    });

  } catch (error) {
    if (error.message === ERROR_TYPES.MISSING_PASSWORD) {
      return handleError(res, ERROR_TYPES.MISSING_PASSWORD, "Le mot de passe est requis.");
    }
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { userEmail, password, hCaptchaToken } = req.body;

  try {
    // Input validation
    if (!userEmail || !password || !hCaptchaToken) {
      return handleError(res, ERROR_TYPES.MISSING_FIELDS, "Tous les champs sont obligatoires.");
    }

    // CAPTCHA verification
    const captchaData = await verifyCaptcha(hCaptchaToken);
    if (!captchaData.success) {
      return handleError(res, ERROR_TYPES.CAPTCHA_FAILED, "Échec de la vérification CAPTCHA");
    }

    // User verification
    const user = await User.findOne({ userEmail });
    if (!user) {
      return handleError(res, ERROR_TYPES.USER_NOT_FOUND, "Email ou mot de passe incorrect.", 401);
    }

    // Password verification
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleError(res, ERROR_TYPES.INVALID_CREDENTIALS, "Email ou mot de passe incorrect.", 401);
    }

    // Token generation
    const accessToken =  jwt.sign(
      { _id: user._id, userEmail: user.userEmail, role: user.role, status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Set HTTP-only cookie
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2592000000, // 30 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return res.status(200).json({
      success: true,
      message: "Connexion réussie !",
      data: {
        accessToken,
        user: {
          _id: user._id,
          userEmail: user.userEmail,
          role: user.role,
          status: user.status
        },
      }
    });

  } catch (error) {
    console.error('Login error details:', error);
    next(error);
  }
};

const GetUserbyID = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return handleError(res, ERROR_TYPES.USER_NOT_FOUND, "Utilisateur non trouvé.", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Utilisateur récupéré avec succès.",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get booking history for a specific user (populated)
const getUserBookingHistory = async (req, res, next) => {
  try {
    const userId = req.params.id || req.query.userId;
    if (!userId) return handleError(res, ERROR_TYPES.MISSING_FIELDS, 'userId is required');

    const user = await User.findById(userId)
      .populate({
        path: 'BookingHistory.bookingId',
        populate: { path: 'activity' }
      });

    if (!user) return handleError(res, ERROR_TYPES.USER_NOT_FOUND, 'Utilisateur non trouvé.', 404);

    const history = (user.BookingHistory || []).map(item => item.bookingId).filter(Boolean);

    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

const updateUserByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Fetch current user prior to update so we can detect changes
    const previousUser = await User.findById(id);
    if (!previousUser) {
      return handleError(res, ERROR_TYPES.USER_NOT_FOUND, "Utilisateur non trouvé.", 404);
    }

    // Remove password from updatedData if it's empty or not provided
    if (updatedData.password === '' || !updatedData.password) {
      delete updatedData.password;
    }

    // Check existing credentials (email/matricule) excluding this user
    const existingUserError = await checkExistingUser(
      updatedData.userEmail,
      updatedData.matricule,
      id
    );

    if (existingUserError) {
      return handleError(res, existingUserError.type, existingUserError.message);
    }

    // Update user (excluding password if not provided)
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedUser) {
      return handleError(res, ERROR_TYPES.USER_NOT_FOUND, "Utilisateur non trouvé.", 404);
    }

    // Notify user if status changed
    try {
      if (previousUser.status !== updatedUser.status) {
        sendStatusChangeEmail({
          to: updatedUser.userEmail,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          oldStatus: previousUser.status,
          newStatus: updatedUser.status
        }).catch(err => console.error('Status email error:', err));
      }
    } catch (notifyErr) {
      console.error('Failed to send status change email:', notifyErr);
    }

    // Notify user if role changed
    try {
      if (previousUser.role !== updatedUser.role) {
        sendEmail({
          to: updatedUser.userEmail,
          subject: 'Mise à jour de votre rôle',
          text: `Bonjour ${updatedUser.firstName} ${updatedUser.lastName},\n\nVotre rôle a été modifié de '${previousUser.role}' à '${updatedUser.role}'.\n\nCordialement,\nL'équipe de support.`
        }).catch(err => console.error('Role email error:', err));
      }
    } catch (notifyErr) {
      console.error('Failed to send role change email:', notifyErr);
    }

    return res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès.",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

const updateUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { CurrentPassword, NewPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return handleError(res, ERROR_TYPES.USER_NOT_FOUND, "Utilisateur non trouvé.", 404);
    }

    const isMatch = await bcrypt.compare(CurrentPassword, user.password);
    if (!isMatch) {
      return handleError(res, ERROR_TYPES.PASSWORD_MISMATCH, "Mot de passe actuel incorrect.", 401);
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(NewPassword);
    if (!passwordValidation.valid) {
      return handleError(res, ERROR_TYPES.VALIDATION_ERROR, passwordValidation.message, 400);
    }

    user.password = await hashPassword(NewPassword);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Mot de passe mis à jour avec succès."
    });
  } catch (error) {
    next(error);
  }
};

const DeleteUserById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return handleError(res, ERROR_TYPES.USER_NOT_FOUND, "Utilisateur non trouvé.", 404);
    }

    // Send deletion email and check result in production
    const emailResult = await sendEmail({
      to: user.userEmail,
      subject: "Suppression de votre compte amicale AGIL",
      text: `Bonjour ${user.firstName} ${user.lastName},\n\nVotre compte a été supprimé avec succès.\n\nCordialement,\nL'équipe de support.`
    });

    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      console.error('Failed to send account deletion email:', {
        userId: user._id,
        email: user.userEmail,
        error: emailResult.error?.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès."
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users.length) {
      return handleError(res, ERROR_TYPES.NO_USERS_FOUND, "Aucun utilisateur trouvé.", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Utilisateurs récupérés avec succès.",
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const AddUserByAdmin = async (req, res, next) => {
  const { firstName, lastName, userEmail, userPhone, matricule, password, role, status } = req.body;

  try {
    // Required fields check
    if (!firstName || !lastName || !userEmail || !matricule || !role || !password) {
      return handleError(res, ERROR_TYPES.MISSING_FIELDS, "Certains champs obligatoires sont manquants, y compris le mot de passe.");
    }

    // Existing user check
    const existingUserError = await checkExistingUser(userEmail, matricule);
    if (existingUserError) return handleError(res, existingUserError.type, existingUserError.message);

    // Create user with hashed password
    const newUser = new User({
      firstName,
      lastName,
      userEmail,
      userPhone,
      matricule,
      password: await hashPassword(password),
      role,
      status,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Utilisateur ajouté par l'admin avec succès !",
      data: newUser
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return handleError(res, ERROR_TYPES.MISSING_FIELDS, "Le nouveau statut est requis.");
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
      return handleError(res, ERROR_TYPES.USER_NOT_FOUND, "Utilisateur non trouvé.", 404);
    }

    // Send status update email and check result in production
    const emailResult = await sendEmail({
      to: user.userEmail,
      subject: "Mise à jour de votre statut",
      text: `Bonjour ${user.firstName} ${user.lastName},\n\nVotre statut a été mis à jour : ${status}.\n\nCordialement,\nL'équipe de support.`
    });

    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      console.error('Failed to send status update email:', {
        userId: user._id,
        email: user.userEmail,
        newStatus: status,
        error: emailResult.error?.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Statut de l'utilisateur mis à jour avec succès.",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { userEmail } = req.body;

  try {
    if (!userEmail) {
      return handleError(res, ERROR_TYPES.MISSING_FIELDS, "Email est requis");
    }

    const user = await User.findOne({ userEmail });
    if (!user) return handleError(res, ERROR_TYPES.USER_NOT_FOUND, "Utilisateur non trouvé", 404);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min
    await user.save();

    // Send reset email and check result
    const resetUrl = `${process.env.CLIENT_URI}/reset-password/${resetToken}`;

    const emailResult = await sendEmail({
      to: user.userEmail,
      subject: "Password Reset",
      html: `<p>Cliquer <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe. Ce lien expirera dans 15 minutes.</p>`
    });

    // In production, check if email was sent successfully
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', {
        userId: user._id,
        email: user.userEmail,
        error: emailResult.error?.message
      });

      if (process.env.NODE_ENV === 'production') {
        return handleError(res, ERROR_TYPES.SERVER_ERROR, "Impossible d'envoyer l'email de réinitialisation. Veuillez contacter le support.", 500);
      }
    }

    return res.status(200).json({ message: "Lien de réinitialisation envoyé par e-mail" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return handleError(res, ERROR_TYPES.MISSING_FIELDS, "Token et mot de passe sont requis");
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return handleError(res, ERROR_TYPES.VALIDATION_ERROR, passwordValidation.message, 400);
    }

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return handleError(res, ERROR_TYPES.INVALID_CREDENTIALS, "Token invalide ou expiré");
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  GetUserbyID,
  getUserBookingHistory,
  updateUserByID,
  updateUserPassword,
  DeleteUserById,
  getAllUsers,
  AddUserByAdmin,
  forgotPassword,
  updateUserStatus,
  resetPassword
};