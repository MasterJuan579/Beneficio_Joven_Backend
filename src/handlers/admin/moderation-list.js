const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['administrador','moderador']);
    const status = (event.queryStringParameters?.status || 'PENDING').toUpperCase();

    const conn = await getConnection();
    const [rows] = await conn.query(`
      SELECT id, entityType, entityId, submittedBy, action, payload, status, reviewedBy, reviewedAt, reason, created_at
      FROM ModeracionQueue
      WHERE status = ?
      ORDER BY created_at ASC
    `, [status]);

    return { statusCode:200, headers, body: JSON.stringify({ success:true, data: rows }) };
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
