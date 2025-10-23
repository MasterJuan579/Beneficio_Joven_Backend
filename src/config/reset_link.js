const crypto = require('crypto');

function signParams({ email, type, exp }) {
  const base = `${email}|${type}|${exp}`;
  return crypto.createHmac('sha256', process.env.RESET_LINK_SECRET || 'dev-secret')
               .update(base).digest('hex');
}

function verifyParams({ email, type, exp, sig }) {
  if (!email || !type || !exp || !sig) return false;
  const now = Date.now();
  if (Number(exp) < now) return false;
  const expected = signParams({ email, type, exp });
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

module.exports = { signParams, verifyParams };
