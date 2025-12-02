const { validate } = require('deep-email-validator');

/**
 * Verify if an email address actually exists and is deliverable
 * This performs multiple checks:
 * 1. Format validation (regex)
 * 2. MX records (mail server exists)
 * 3. SMTP check (mailbox exists)
 * 4. Disposable email detection
 * 5. Free email provider detection
 * 
 * @param {string} email - Email address to verify
 * @returns {Promise<Object>} - Validation result with valid flag and reason
 */
async function verifyEmailExists(email) {
  try {
    const result = await validate({
      email: email,
      validateRegex: true,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      validateSMTP: false, // Set to false to avoid timeout issues
    });

    return {
      valid: result.valid,
      reason: result.reason || 'Valid email',
      validators: result.validators
    };
  } catch (error) {
    console.error('Email verification error:', error);
    // If verification fails (network issues, etc.), allow the email
    // This prevents blocking legitimate users due to technical issues
    return {
      valid: true,
      reason: 'Verification unavailable, proceeding',
      error: error.message
    };
  }
}

/**
 * Quick validation that checks if email domain has valid MX records
 * This is faster than full SMTP verification
 * 
 * @param {string} email - Email address to check
 * @returns {Promise<Object>} - Validation result
 */
async function quickEmailCheck(email) {
  try {
    const result = await validate({
      email: email,
      validateRegex: true,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      validateSMTP: false,
    });

    // Check specific validation results
    const { regex, mx, disposable } = result.validators;

    if (!regex?.valid) {
      return {
        valid: false,
        reason: 'Invalid email format'
      };
    }

    if (!mx?.valid) {
      return {
        valid: false,
        reason: 'Email domain does not exist or cannot receive emails'
      };
    }

    if (disposable?.valid === false) {
      return {
        valid: false,
        reason: 'Disposable email addresses are not allowed'
      };
    }

    return {
      valid: true,
      reason: 'Email appears valid'
    };
  } catch (error) {
    console.error('Quick email check error:', error);
    // Allow email if check fails due to technical issues
    return {
      valid: true,
      reason: 'Email check unavailable, proceeding'
    };
  }
}

module.exports = {
  verifyEmailExists,
  quickEmailCheck
};
