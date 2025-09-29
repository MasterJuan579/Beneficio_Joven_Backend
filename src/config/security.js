require('dotenv').config();

const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: '30m',
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000
};

module.exports = SECURITY_CONFIG;