const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'cambia-esto-por-secreto-real-seguro',
  JWT_EXPIRES: '30m',
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000 // 15 minutos
};

module.exports = SECURITY_CONFIG;