/**
 * Format a date object or string into YYYY-MM-DD
 * @param {Date|string} date 
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Remove sensitive credentials from user object
 * @param {Object} user 
 * @returns {Object}
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const sanitized = { ...user };
  delete sanitized.passwordHash;
  return sanitized;
};

/**
 * Safe JSON parsing helper
 * @param {string} str 
 * @param {*} defaultVal 
 * @returns {*}
 */
const safeJsonParse = (str, defaultVal = null) => {
  try {
    return str ? JSON.parse(str) : defaultVal;
  } catch {
    return defaultVal;
  }
};

module.exports = {
  formatDate,
  sanitizeUser,
  safeJsonParse,
};
