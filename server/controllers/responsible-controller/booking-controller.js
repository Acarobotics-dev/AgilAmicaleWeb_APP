const Booking = require("../../models/booking");
const Event = require("../../models/Events"); // Add this at the top if not already imported
const { sendEmail } = require("../../helpers/mailer"); // ✅ Import mail helper
const User = require("../../models/User"); // Make sure you have a User model with email field
const House = require('../../models/House');  // For "Sejour Maison"

// Error messages object for consistency
const ERROR_MESSAGES = {
  INVALID_PERIOD: "La période de réservation est invalide.",
  OVERLAPPING_BOOKING:
    "Vous avez déjà une réservation pour cette activité et cette période.",
  MISSING_FIELDS: "Tous les champs sont obligatoires.",
  VALIDATION_ERROR: "Erreur de validation des données.",
  SERVER_ERROR: "La création de la réservation a échoué",
};

const createBooking = async (req, res, next) => {
  try {
    const { userId, activity, activityCategory, bookingPeriod } = req.body;

    const activityModel =
      activityCategory === "Sejour Maison" ? "House" : "Event";
    let period = bookingPeriod;
    let event; // will hold Event doc when activityModel === 'Event'

    if (activityModel === "House") {
      if (typeof period === "string") {
        try {
          period = JSON.parse(period);
        } catch {
          return res.status(400).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_PERIOD,
            errorType: "invalid_period",
            errorCode: "BOOKING_001",
          });
        }
      }
      if (
        !period?.start ||
        !period?.end ||
        new Date(period.start) >= new Date(period.end)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "La période de réservation doit avoir une date de début et de fin valides",
          errorType: "invalid_dates",
          errorCode: "BOOKING_002",
        });
      }
      const overlappingBooking = await Booking.findOne({
        userId,
        activity,
        "bookingPeriod.start": { $lte: period.end },
        "bookingPeriod.end": { $gte: period.start },
      });
      if (overlappingBooking) {
        return res.status(409).json({
          success: false,
          message: ERROR_MESSAGES.OVERLAPPING_BOOKING,
          errorType: "overlapping_booking",
          errorCode: "BOOKING_003",
          conflictingBooking: {
            id: overlappingBooking._id,
            period: overlappingBooking.bookingPeriod,
          },
        });
      }
    } else {
      const existingEventBooking = await Booking.findOne({
        userId,
        activity,
        activityModel: "Event",
      });
      if (existingEventBooking) {
        return res.status(409).json({
          success: false,
          message: "Vous avez déjà réservé cet évènement.",
          errorType: "duplicate_event_booking",
          errorCode: "BOOKING_006",
        });
      }

      // No need to fetch the event here; we'll check and increment atomically below
    }

    if (!userId || !activity || !activityCategory) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.MISSING_FIELDS,
        errorType: "missing_fields",
        errorCode: "BOOKING_004",
      });
    }

    // Participants (optional) - expect array of { firstName, lastName, age, type }
    const participants = Array.isArray(req.body.participants) ? req.body.participants : [];

    // Save booking
    const booking = new Booking({
      userId,
      activity,
      activityCategory,
      activityModel,
      participants,
      ...(activityModel === "House" ? { bookingPeriod: period } : {}),
    });

    // If Event, atomically check capacity and increment participants
    if (activityModel === "Event") {
      // First fetch the event to get maxParticipants value
      const event = await Event.findById(activity);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Évènement introuvable.",
          errorType: "event_not_found",
          errorCode: "BOOKING_007",
        });
      }

      // Use findOneAndUpdate with explicit capacity check to prevent race condition
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: activity,
          currentParticipants: { $lt: event.maxParticipants }
        },
        { $inc: { currentParticipants: 1 } },
        { new: true }
      );

      if (!updatedEvent) {
        // Event exists but is full
        return res.status(400).json({
          success: false,
          message: "Le nombre maximum de participants a été atteint pour cet évènement.",
          errorType: "event_full",
          errorCode: "BOOKING_008",
        });
      }

      // Validate required participant info according to event pricing
      try {
        // If childPresence is enabled, require at least one child participant
        if (event.childPresence && event.childPrice && Number(event.childPrice) > 0) {
          const childParticipants = participants.filter(p => String(p.type).toLowerCase() === 'child');
          if (!childParticipants.length) {
            return res.status(400).json({
              success: false,
              message: "Les informations de l'enfant sont requises pour ce tarif.",
              errorType: "missing_child_info",
              errorCode: "BOOKING_009",
            });
          }
          // validate each child participant
          for (const c of childParticipants) {
            if (!c.firstName || !c.lastName || (typeof c.age === 'undefined' || c.age === null)) {
              return res.status(400).json({
                success: false,
                message: "Chaque enfant doit avoir un prénom, nom et âge.",
                errorType: "invalid_child_info",
                errorCode: "BOOKING_010",
              });
            }
          }
          // Optionally enforce max number of children
          if (typeof event.numberOfChildren === 'number' && childParticipants.length > event.numberOfChildren) {
            return res.status(400).json({
              success: false,
              message: `Nombre d'enfants dépassé (max ${event.numberOfChildren}).`,
              errorType: "too_many_children",
              errorCode: "BOOKING_011",
            });
          }
        }

        // If cojoinPresence is enabled, require at least one companion participant
        if (event.cojoinPresence && event.cojoinPrice && Number(event.cojoinPrice) > 0) {
          const cojoinParticipants = participants.filter(p => String(p.type).toLowerCase() === 'cojoint' || String(p.type).toLowerCase() === 'companion');
          if (!cojoinParticipants.length) {
            return res.status(400).json({
              success: false,
              message: "Les informations de l'accompagnant sont requises pour ce tarif.",
              errorType: "missing_cojoin_info",
              errorCode: "BOOKING_012",
            });
          }
          for (const a of cojoinParticipants) {
            if (!a.firstName || !a.lastName || (typeof a.age === 'undefined' || a.age === null)) {
              return res.status(400).json({
                success: false,
                message: "Chaque accompagnant doit avoir un prénom, nom et âge.",
                errorType: "invalid_cojoin_info",
                errorCode: "BOOKING_013",
              });
            }
          }
          if (typeof event.numberOfCompanions === 'number' && cojoinParticipants.length > event.numberOfCompanions) {
            return res.status(400).json({
              success: false,
              message: `Nombre d'accompagnants dépassé (max ${event.numberOfCompanions}).`,
              errorType: "too_many_cojoin",
              errorCode: "BOOKING_014",
            });
          }
        }
      } catch (validationErr) {
        console.error('Participant validation failed:', validationErr);
        return res.status(400).json({ success: false, message: 'Erreur de validation des participants.' });
      }

      // Set booking period from event dates
      booking.bookingPeriod = {
        start: updatedEvent.startDate,
        end: updatedEvent.endDate
      };
      booking.eventStart = updatedEvent.startDate;
      booking.eventEnd = updatedEvent.endDate;
    }

    await booking.save();

    // Add booking to user's BookingHistory
    try {
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $push: { BookingHistory: { bookingId: booking._id } }
        });
      }
    } catch (err) {
      console.error('Failed to add booking to user BookingHistory:', err);
    }

    // Fetch user and populate activity info for email
    const user = await User.findById(userId);
    if (user && user.userEmail) {
      // Populate booking with activity details
      const bookingPopulated = await Booking.findById(booking._id).populate(
        "activity"
      );

      // Prepare email content
      let bookingDetails = `Type: ${bookingPopulated.activityCategory}\n`;
      if (bookingPopulated.activityCategory === "Sejour Maison" && bookingPopulated.bookingPeriod) {
        const start = new Date(bookingPopulated.bookingPeriod.start).toLocaleDateString("fr-FR");
        const end = new Date(bookingPopulated.bookingPeriod.end).toLocaleDateString("fr-FR");
        bookingDetails += `Période: du ${start} au ${end}\n`;
      }
      // If this is an Event booking, include the event's start/end if available
      if (bookingPopulated.activityCategory === "Event" && bookingPopulated.activity) {
        const evStart = bookingPopulated.eventStart || bookingPopulated.activity.startDate;
        const evEnd = bookingPopulated.eventEnd || bookingPopulated.activity.endDate;
        if (evStart && evEnd) {
          const s = new Date(evStart).toLocaleDateString("fr-FR");
          const e = new Date(evEnd).toLocaleDateString("fr-FR");
          bookingDetails += `Période: du ${s} au ${e}\n`;
        }
      }
      bookingDetails += `Détails: ${bookingPopulated.activity?.title || bookingPopulated.activity?.name || "N/A"}\n`;

      // Send booking request email (fire and forget)
      const subject = 'Amicale-Demande de réservation';
      const text = `Bonjour ${user.firstName || ''},\n\nVotre demande de réservation a été bien enregistrée.\n\n${bookingDetails}\nMerci de votre confiance.`;
      const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:24px;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;color:#0f172a;">` +
        `<div style="max-width:680px;margin:0 auto;">` +
        `<div style="background:#fff;border-radius:8px;padding:24px;box-shadow:0 2px 8px rgba(16,24,40,0.06);">` +
        `<h1 style="font-size:20px;margin:0 0 8px;color:#0f172a;font-weight:700;">Demande de réservation reçue</h1>` +
        `<p style="margin:0 0 16px;color:#475569;font-size:15px;">Bonjour ${user.firstName || ''},</p>` +
        `<p style="margin:0 0 18px;color:#334155;font-size:15px;">Votre demande de réservation a bien été enregistrée. Retrouvez ci-dessous le récapitulatif :</p>` +
        `<div style="background:#f8fafc;border:1px solid #e6eef6;padding:12px;border-radius:6px;margin-bottom:18px;color:#0f172a;font-size:14px;">` +
        `${bookingDetails.split('\n').map(line => `<div style="padding:6px 0;">${line}</div>`).join('')}` +
        `</div>` +
        `<p style="margin:0;color:#475569;font-size:14px;">Nous vous contacterons si une action complémentaire est nécessaire.</p>` +
        `<p style="margin:18px 0 0 0;color:#64748b;font-size:13px;">Cordialement,<br/>L'équipe Amicale AGIL</p>` +
        `</div>` +
        `</div></body></html>`;

      const emailResult = await sendEmail({ to: user.userEmail, subject, text, html });

      if (!emailResult.success) {
        console.error('Erreur en envoyant l\'email de réservation :', emailResult.error);

        if (process.env.NODE_ENV === 'production') {
          console.error('CRITICAL: Failed to send booking confirmation email:', {
            bookingId: booking._id,
            userId: user._id,
            email: user.userEmail,
            error: emailResult.error?.message
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Votre réservation a été créée avec succès",
      data: booking,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errorType: "validation_error",
        errorCode: "BOOKING_005",
        details: error.errors,
      });
    }
    // Delegate to global error handler for unexpected errors
    next(error);
  }
};

// Get all bookings or by query
const getBookings = async (req, res, next) => {
  try {
    const filter = req.query || {};
    const bookings = await Booking.find(filter);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Update a booking by ID
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const booking = await Booking.findByIdAndUpdate(id, update, { new: true });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }
    res.status(200).json({
      success: true,
      message: "Réservation mise à jour avec succès",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
// Helper function to generate date strings (YYYY-MM-DD) between start and end (inclusive)
const getDatesInRange = (startDate, endDate) => {
  const dates = [];

  // Normalize start and end dates to UTC midnight
  let currentDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  const end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

  while (currentDate <= end) {
    // Push ISO date string (YYYY-MM-DD) to match House.unavailableDates schema
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
};


const updateStatusBooking = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Le nouveau statut est requis.",
    });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("activity");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }

    // Send immediate response
    res.status(200).json({
      success: true,
      message: "Statut de la réservation mis à jour avec succès",
      data: booking,
    });

    /* BACKGROUND PROCESSING */

    // 1. Handle unavailable periods for approved "Sejour Maison"
    if (booking.activityCategory === "Sejour Maison" &&
        status.toLowerCase() === "confirmé" &&
        booking.bookingPeriod?.start &&
        booking.bookingPeriod?.end) {

      try {
        if (!booking.activity || !booking.activity._id) {
          throw new Error("House reference missing in booking");
        }

        const datesToAdd = getDatesInRange(
          new Date(booking.bookingPeriod.start),
          new Date(booking.bookingPeriod.end)
        );

        // Update the House model (not Activity)
        await House.findByIdAndUpdate(
          booking.activity._id,
          {
            $addToSet: {
              unavailableDates: {
                $each: datesToAdd
              }
            }
          }
        );
      } catch (error) {
        console.error("Failed to update house unavailable periods:", error.message);
      }
    }

    // 1b. Remove unavailable dates when house booking is cancelled or completed
    if (booking.activityCategory === "Sejour Maison" &&
        (status.toLowerCase() === "annulé" || status.toLowerCase() === "terminé") &&
        booking.bookingPeriod?.start &&
        booking.bookingPeriod?.end) {

      try {
        if (!booking.activity || !booking.activity._id) {
          throw new Error("House reference missing in booking");
        }

        const datesToRemove = getDatesInRange(
          new Date(booking.bookingPeriod.start),
          new Date(booking.bookingPeriod.end)
        );

        // Remove dates from House unavailableDates
        await House.findByIdAndUpdate(
          booking.activity._id,
          {
            $pullAll: {
              unavailableDates: datesToRemove
            }
          }
        );
      } catch (error) {
        console.error("Failed to remove house unavailable periods:", error.message);
      }
    }

    // 2. Send email notification
     try {
       const user = await User.findById(booking.userId);
       if (!user || !user.userEmail) {
         console.warn("Email not sent: Missing user or email");
         return;
       }

      const bookingStart = booking.bookingPeriod?.start
        ? new Date(booking.bookingPeriod.start).toLocaleDateString("fr-FR")
        : "";
      const bookingEnd = booking.bookingPeriod?.end
        ? new Date(booking.bookingPeriod.end).toLocaleDateString("fr-FR")
        : "";

      let activityName = "votre réservation";
      if (booking.activity) {
        activityName = booking.activity.title ||
                     booking.activity.name ||
                     "votre " + booking.activityCategory.toLowerCase();
      }

      // Choose subject/text based on status
      let subject = 'Amicale-Mise à jour de votre réservation';
      let bookingTextBody = `Le statut de votre réservation a changé : ${status.toUpperCase()}\n\n`;
      if (bookingStart && bookingEnd) {
        bookingTextBody += `Période: du ${bookingStart} au ${bookingEnd}\n`;
      }
      bookingTextBody += `Type: ${booking.activityCategory}\n`;
      bookingTextBody += `Détails: ${activityName}\n\n`;
      // Keep an HTML-safe main copy without arabicTerms to avoid duplication
      let bookingTextBodyForHtml = bookingTextBody;

      if (String(status).toLowerCase().includes('confirm')) {
        subject = 'Amicale-Confirmation de réservation';
        bookingTextBody = `Bonjour ${user.firstName || ''},\n\nVotre demande de réservation est confirmée.\n\n` +
          (bookingStart && bookingEnd ? `Période: du ${bookingStart} au ${bookingEnd}\n\n` : '') +
          `Type: ${booking.activityCategory}\nDétails: ${activityName}\n\nMerci.`;

        // If this is a house booking, prepare the special Arabic terms (plain text + RTL HTML)
        if (String(booking.activityCategory).toLowerCase() === 'sejour maison' || booking.activityCategory === 'Sejour Maison') {
          const arabicTerms = `\n\nالشروط الخــاصة:\n\nيتعهد المنتفع ببرنامج المصيف العائلي:\n    • باحترام المواعيد الدخول و المغادرة، المحددّة أعلاه.\n    • المحافظة على نظافة المكان.\n    • الحفاظ على سلامة الأثاث و التجهيزات الموضوعة تحت تصرّفه.\n    • تعويض كل إتلاف أو ضرر أو فقدان أحد عناصر هذا الأثاث أو هذه التجهيزات.\n    • خــلاص كامل معلوم مساهمته في صورة العدول عن المشاركة لأي سبب كان بعد الترسيم في هذا النشاط.\n\nيمنع منعــا باتا التفويت في حق التمتّع بالإقامة لأي شخص آخـــر،\nأي مخـــالفة في هذا المجال تعرّض صاحبها إلى إجراءات تأديبية.`;
          // (do not append Arabic to plain-text body) -- Arabic will be injected only in HTML (RTL) to avoid duplication
          // HTML should not include the Arabic terms in the main text (we will inject a RTL block)
          var arabicHtml = `\n<div dir="rtl" style="direction:rtl;text-align:right;font-family:Tahoma, Arial, 'Noto Naskh Arabic', sans-serif;background:#fff;padding:12px;border-radius:6px;margin-top:12px;line-height:1.6;color:#0f172a;">` +
            arabicTerms.split('\n').map(l => `<div>${l.replace(/ /g,'&nbsp;')}</div>`).join('') +
            `</div>`;
        }
      }

      // include arabicHtml when applicable
      const htmlBody = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:24px;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;color:#0f172a;">` +
        `<div style="max-width:680px;margin:0 auto;">` +
        `<div style="background:#fff;border-radius:8px;padding:24px;box-shadow:0 2px 8px rgba(16,24,40,0.06);">` +
        `<h1 style="font-size:20px;margin:0 0 8px;color:#0f172a;font-weight:700;">Mise à jour de votre réservation</h1>` +
        `<div style="margin:12px 0 18px;color:#475569;font-size:15px;">${String(bookingTextBodyForHtml).replace(/\n/g,'<br/>')}</div>` +
        `${typeof arabicHtml !== 'undefined' ? arabicHtml : ''}` +
        `<p style="margin:0;color:#64748b;font-size:13px;">Cordialement,<br/>L'équipe Amicale AGIL</p>` +
        `</div></div></body></html>`;

      const emailResult = await sendEmail({
        to: user.userEmail,
        subject,
        text: bookingTextBody,
        html: htmlBody,
      });

      if (!emailResult.success) {
        console.error('Failed to send booking status update email:', emailResult.error);

        if (process.env.NODE_ENV === 'production') {
          console.error('CRITICAL: Failed to send booking status email:', {
            bookingId: booking._id,
            userId: user._id,
            email: user.userEmail,
            newStatus: status,
            error: emailResult.error?.message
          });
        }
      }
     } catch (emailError) {
       console.error("Email sending failed:", emailError.message);
     }

  } catch (error) {
    console.error("Booking update error:", error);
    next(error);
  }
};


// Delete a booking by ID
const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch booking first to get details before deletion
    const booking = await Booking.findById(id).populate("activity");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }

    // Handle side effects before deletion

    // 1. If Event booking, decrement currentParticipants
    if (booking.activityModel === "Event" && booking.activity && booking.activity._id) {
      try {
        await Event.findByIdAndUpdate(
          booking.activity._id,
          { $inc: { currentParticipants: -1 } }
        );
      } catch (error) {
        console.error("Failed to decrement event participants on booking deletion:", error.message);
      }
    }

    // 2. If House booking, remove dates from unavailableDates
    if (booking.activityCategory === "Sejour Maison" &&
        booking.bookingPeriod?.start &&
        booking.bookingPeriod?.end &&
        booking.activity &&
        booking.activity._id) {

      try {
        const datesToRemove = getDatesInRange(
          new Date(booking.bookingPeriod.start),
          new Date(booking.bookingPeriod.end)
        );

        await House.findByIdAndUpdate(
          booking.activity._id,
          {
            $pullAll: {
              unavailableDates: datesToRemove
            }
          }
        );
      } catch (error) {
        console.error("Failed to remove house unavailable dates on booking deletion:", error.message);
      }
    }

    // Delete the booking after handling side effects
    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Réservation supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  updateStatusBooking,
};
