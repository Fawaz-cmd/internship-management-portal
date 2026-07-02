module.exports = {
  secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};
