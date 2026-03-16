// =============================================================================
// src/utils/validators.js
// =============================================================================
// ✅ FORM VALIDATION RULES
//
// Each function takes a value and returns an error string, or '' if valid.
// Use these in your page's validate() function before saving.
// =============================================================================

/** Field must not be empty */
export function required(value, fieldName = 'This field') {
  if (!value || !String(value).trim()) return `${fieldName} is required.`;
  return '';
}

/** Must be a valid email address */
export function validEmail(value) {
  if (!value) return 'Email is required.';
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  return ok ? '' : 'Please enter a valid email address.';
}

/** Must be at least N characters */
export function minLength(value, n) {
  if (!value || String(value).trim().length < n) return `Must be at least ${n} characters.`;
  return '';
}

/** Must be a positive number */
export function positiveNumber(value) {
  if (value === '' || value === null || value === undefined) return '';
  if (isNaN(Number(value)) || Number(value) < 0) return 'Must be a positive number.';
  return '';
}

/**
 * Run multiple validators and return first error found.
 * @param {*}        value      - The field value to check
 * @param {Array}    rules      - Array of validator functions
 * @returns {string}            - Error message or ''
 *
 * EXAMPLE:
 *   const err = validate(form.email, [required, validEmail]);
 */
export function validate(value, rules = []) {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return '';
}

/**
 * Validate an entire form object at once.
 * @param {object} schema - { fieldName: [rules] }
 * @param {object} form   - The form state object
 * @returns {object}      - { fieldName: errorString } (only fields with errors)
 *
 * EXAMPLE:
 *   const errors = validateForm(
 *     { name: [required], email: [required, validEmail] },
 *     form
 *   );
 *   if (Object.keys(errors).length > 0) return; // stop if invalid
 */
export function validateForm(schema, form) {
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    const error = validate(form[field], rules);
    if (error) errors[field] = error;
  }
  return errors;
}
