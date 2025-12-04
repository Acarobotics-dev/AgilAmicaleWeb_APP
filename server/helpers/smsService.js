// helpers/smsService.js
const twilio = require("twilio");

// Create a single client instance that will be reused
let client = null;
let smsEnabled = false;

/**
 * Normalize phone number to E.164 format
 * Handles Tunisian phone numbers by prepending +216 if needed
 * @param {string} phone - The phone number to normalize
 * @returns {string|null} - Normalized phone number or null if invalid
 */
const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned) return null;

  // If already in E.164 format (starts with +)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If starts with 00 (international format), convert to +
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.substring(2);
  }

  // Tunisian numbers: 8 digits starting with 2, 5, 9, or 7
  // Prepend +216 for local Tunisian format
  if (cleaned.length === 8 && /^[2579]/.test(cleaned)) {
    return '+216' + cleaned;
  }

  // If starts with 216 (without +), add +
  if (cleaned.startsWith('216') && cleaned.length === 11) {
    return '+' + cleaned;
  }

  // For other formats, try to use as-is with + prefix if reasonable length
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return '+' + cleaned;
  }

  console.warn(`⚠️ Unable to normalize phone number: ${phone}`);
  return null;
};

const createClient = () => {
  // Check for required Twilio environment variables
  const requiredVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    const errorMessage = `Twilio configuration missing: ${missing.join(', ')}`;

    // In production, treat missing SMS config as a warning (not critical like email)
    if (process.env.NODE_ENV === 'production') {
      console.warn(`⚠️ SMS disabled: ${errorMessage}`);
    } else {
      console.warn(`⚠️ SMS disabled in development: ${errorMessage}`);
    }

    smsEnabled = false;
    return null;
  }

  if (!client) {
    try {
      client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      smsEnabled = true;
    } catch (error) {
      console.error("❌ Failed to initialize Twilio client:", error.message);
      smsEnabled = false;
      return null;
    }
  }
  return client;
};

// Initialize and verify Twilio client on module load
const initializeSMS = async () => {
  try {
    const twilioClient = createClient();
    if (!twilioClient) {
      console.warn("⚠️ SMS features are disabled due to missing configuration");
      return;
    }

    // Verify credentials by fetching account info
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log(`✅ Twilio SMS service is ready (Account: ${account.friendlyName})`);
  } catch (error) {
    console.error("❌ Twilio verification failed:", error.message);

    if (process.env.NODE_ENV === 'production') {
      console.warn("⚠️ SMS service not available in production - notifications will be skipped");
    }

    smsEnabled = false;
  }
};

// Initialize the SMS service when the module is loaded
initializeSMS();

/**
 * Send a single SMS message
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<{success: boolean, error?: Error, messageId?: string}>}
 */
const sendSMS = async (to, message) => {
  // Check if SMS is enabled
  if (!smsEnabled || !client) {
    const error = new Error("SMS service is not configured or disabled");

    if (process.env.NODE_ENV === 'production') {
      console.warn("⚠️ SMS not sent: SMS service is disabled", {
        to,
        timestamp: new Date().toISOString()
      });
    }

    return { success: false, error };
  }

  // Normalize the phone number
  const normalizedPhone = normalizePhone(to);
  if (!normalizedPhone) {
    const error = new Error(`Invalid phone number format: ${to}`);
    console.warn(`⚠️ SMS not sent: ${error.message}`);
    return { success: false, error };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone
    });

    console.log(`✅ SMS sent successfully to ${normalizedPhone} (SID: ${result.sid})`);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error(`❌ SMS send failed to ${normalizedPhone}:`, error.message);
    return { success: false, error };
  }
};

/**
 * Send bulk SMS messages to multiple recipients with concurrency limits.
 * This function blocks until all messages are processed and returns a complete summary.
 * Phone numbers are normalized internally - pass raw phone numbers from the database.
 * @param {string[]} phones - Array of phone numbers (will be normalized internally)
 * @param {string} message - Message content to send to all recipients
 * @param {number} [concurrencyLimit=10] - Maximum concurrent SMS sends (default: 10)
 * @returns {Promise<{total: number, sent: number, failed: number, errors: Array}>}
 */
const sendBulkSMS = async (phones, message, concurrencyLimit = 10) => {
  if (!smsEnabled || !client) {
    console.warn("⚠️ Bulk SMS skipped: SMS service is disabled");
    return { total: phones.length, sent: 0, failed: phones.length, errors: ['SMS service disabled'] };
  }

  if (!phones || !Array.isArray(phones) || phones.length === 0) {
    console.warn("⚠️ Bulk SMS skipped: No valid phone numbers provided");
    return { total: 0, sent: 0, failed: 0, errors: [] };
  }

  // Filter out obviously invalid entries (empty/null) before processing
  const validPhones = phones.filter(p => p && typeof p === 'string' && p.trim() !== '');

  const results = {
    total: validPhones.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  if (validPhones.length === 0) {
    console.warn("⚠️ Bulk SMS skipped: No valid phone numbers after filtering");
    return results;
  }

  console.log(`📱 Starting bulk SMS to ${validPhones.length} recipients (concurrency: ${concurrencyLimit})...`);

  // Process phones in batches with concurrency limit
  for (let i = 0; i < validPhones.length; i += concurrencyLimit) {
    const batch = validPhones.slice(i, i + concurrencyLimit);
    const batchNumber = Math.floor(i / concurrencyLimit) + 1;
    const totalBatches = Math.ceil(validPhones.length / concurrencyLimit);

    if (totalBatches > 1) {
      console.log(`📱 Processing batch ${batchNumber}/${totalBatches} (${batch.length} recipients)...`);
    }

    // Process batch concurrently
    const batchPromises = batch.map(async (phone) => {
      const result = await sendSMS(phone, message);
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ phone, error: result.error?.message || 'Unknown error' });
      }
    });

    await Promise.allSettled(batchPromises);
  }

  console.log(`📱 Bulk SMS completed: ${results.sent}/${results.total} sent, ${results.failed} failed`);

  if (results.errors.length > 0 && results.errors.length <= 5) {
    console.warn("SMS failures:", results.errors);
  } else if (results.errors.length > 5) {
    console.warn(`SMS failures: ${results.errors.length} total (showing first 5)`, results.errors.slice(0, 5));
  }

  return results;
};

module.exports = { sendSMS, sendBulkSMS, normalizePhone };
