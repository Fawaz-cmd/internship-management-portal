const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware factory that creates an audit log entry for the current request
 * @param {string} action - action name e.g. 'user.login'
 * @param {string} [entityType] - entity type e.g. 'User'
 * @param {Function} [getEntityId] - function(req, res_body) => entityId
 */
const audit = (action, entityType = null, getEntityId = null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      // Only log successful mutations
      if (body && body.success !== false) {
        try {
          const entityId = getEntityId ? getEntityId(req, body) : null;
          await AuditLog.create({
            userId: req.user?.id || null,
            action,
            entityType,
            entityId: entityId ? String(entityId) : null,
            changes: body.data || null,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
          });
        } catch (err) {
          logger.error('Audit log failed:', err.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = { audit };
