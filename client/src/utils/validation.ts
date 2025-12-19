// Existing validators...
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return phoneRegex.test(phone);
}

export function validateLettersOnly(value) {
  const lettersRegex = /^[a-zA-ZÀ-ÿ\s-]+$/; // Allow accents and spaces
  return lettersRegex.test(value);
}

export function validatePassword(password) {
  return password.length >= 8;
}

// ✅ New validator: matricule must be exactly 4 digits
export function validateMatricule(matricule) {
  const matriculeRegex = /^\d{4}$/; // Exactly 4 digits
  return matriculeRegex.test(matricule);
}

// ✅ Helper to check if field is non-empty string and not just whitespace
export function isRequired(value) {
  return typeof value === 'string' && value.trim() !== '';
}

// ✅ Unified validation runner
export function validateFields(fields) {
  let isValid = true;

  for (const field of fields) {
    // First check if the field is required (not empty)
    if (!isRequired(field.value)) {
      console.error("Field is required:", field.message);
      alert(field.message || "Ce champ est requis.");
      return false;
    }

    // Then check with the specific validator
    if (!field.validator(field.value)) {
      console.error("Validation failed:", field.message);
      alert(field.message);
      isValid = false;
      break;
    }
  }

  return isValid;
}