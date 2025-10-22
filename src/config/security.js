require('dotenv').config();

const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: '60m',
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 30,
  LOCKOUT_TIME: 15 * 60 * 1000
};

module.exports = SECURITY_CONFIG;