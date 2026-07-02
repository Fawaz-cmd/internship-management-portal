const ROLE_HIERARCHY = {
  super_admin: 7,
  program_manager: 6,
  hr_coordinator: 5,
  mentor: 4,
  team_lead: 3,
  reviewer: 2,
  intern: 1,
};

/**
 * Authorize specific roles
 * @param  {...string} roles - allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

/**
 * Authorize by minimum role level
 * @param {string} minRole - minimum required role
 */
const authorizeLevel = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < minLevel) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
      });
    }
    next();
  };
};

/**
 * Allow access if user is resource owner OR has a higher role
 * @param {Function} getOwnerIdFn - function(req) => ownerId string
 * @param {string} [fallbackRole] - role that can override ownership check
 */
const authorizeOwnerOrRole = (getOwnerIdFn, fallbackRole = 'mentor') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const ownerId = getOwnerIdFn(req);
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const fallbackLevel = ROLE_HIERARCHY[fallbackRole] || 0;
    if (req.user.id === ownerId || userLevel >= fallbackLevel) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied.' });
  };
};

module.exports = { authorize, authorizeLevel, authorizeOwnerOrRole, ROLE_HIERARCHY };
