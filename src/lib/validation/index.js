/**
 * Input validation and sanitization helpers for server-side endpoints.
 * Part of the BPFQuest security foundation.
 */

/**
 * Validates whether a slug consists solely of alphanumeric characters and hyphens.
 * Prevents directory traversal, script injection, and SQL injection in query parameters.
 * 
 * @param {string} slug 
 * @returns {boolean}
 */
export function isValidSlug(slug) {
  if (typeof slug !== 'string') return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
}

/**
 * Sanitizes generic user text input by trimming and escaping basic HTML control characters.
 * 
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[&<>"'/]/g, (char) => {
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
      };
      return escapeMap[char] || char;
    });
}

/**
 * Validates email format.
 * 
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validates integer range (useful for limits, offsets, difficulty levels).
 * 
 * @param {any} val 
 * @param {number} min 
 * @param {number} max 
 * @returns {number|null} Parsed integer or null if invalid
 */
export function validateIntRange(val, min = 0, max = 1000) {
  const num = parseInt(val, 10);
  if (Number.isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}
