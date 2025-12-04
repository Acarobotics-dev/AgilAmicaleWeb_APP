// server/controllers/contactController.js
const ContactMessage = require("../models/Contact");
const { sendEmail } = require("../helpers/mailer");

exports.sendMessage = async (req, res, next) => {
  const { firstName, lastName, email, message } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Tous les champs sont requis."
    });
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Veuillez fournir une adresse email valide."
    });
  }

  try {
    // Save to DB
    const newMessage = new ContactMessage({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      message: message.trim()
    });
    await newMessage.save();

    // Validate EMAIL_USER is configured
    if (!process.env.EMAIL_USER) {
      console.error("EMAIL_USER is not configured - cannot send admin notification");
      return res.json({
        success: true,
        message: "Message enregistré, mais la notification admin n'a pas pu être envoyée (configuration email manquante)."
      });
    }

    // Send Email Notification to admin
    const subject = "Nouveau message de contact";
    const html = `
      <h3>Nouveau message de contact</h3>
      <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    // Use environment variable or fallback to a default email
    const adminEmail = process.env.EMAIL_USER;

    const result = await sendEmail({
      to: adminEmail,  // Send to admin
      replyTo: email,  // Allow admin to reply directly to sender
      subject,
      html
    });

    if (!result.success) {
      console.error("Email sending failed:", result.error);
      // Don't fail the request just because email failed
      return res.json({
        success: true,
        message: "Message enregistré, mais la notification n'a pas pu être envoyée."
      });
    }

    return res.json({
      success: true,
      message: "Message envoyé avec succès."
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    next(error);
  }
};