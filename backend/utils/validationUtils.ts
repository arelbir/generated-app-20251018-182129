/**
 * Validation Utilities (DRY)
 * Common validation functions
 */

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turkish phone number validation regex
 */
export const TURKISH_PHONE_REGEX = /^(\+90|0)?[0-9]{10}$/;

/**
 * UUID validation regex
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * URL validation regex
 */
export const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate Turkish phone number
 */
export const isValidTurkishPhone = (phone: string): boolean => {
  return TURKISH_PHONE_REGEX.test(phone);
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  return UUID_REGEX.test(uuid);
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  return URL_REGEX.test(url);
};

/**
 * Validate string length
 */
export const isValidLength = (str: string, min: number, max?: number): boolean => {
  if (max !== undefined) {
    return str.length >= min && str.length <= max;
  }
  return str.length >= min;
};

/**
 * Validate number range
 */
export const isValidRange = (num: number, min: number, max?: number): boolean => {
  if (max !== undefined) {
    return num >= min && num <= max;
  }
  return num >= min;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Validate Turkish ID number (TC Kimlik No)
 */
export const isValidTurkishId = (id: string): boolean => {
  if (!/^[0-9]{11}$/.test(id)) return false;

  const digits = id.split('').map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenthDigit = ((oddSum * 7) - evenSum) % 10;
  const eleventhDigit = (oddSum + evenSum + tenthDigit) % 10;

  return digits[9] === tenthDigit && digits[10] === eleventhDigit;
};

/**
 * Validate enum value
 */
export const isValidEnum = <T>(value: any, validValues: readonly T[]): value is T => {
  return validValues.includes(value);
};
