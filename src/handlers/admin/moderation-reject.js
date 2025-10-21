const { getConnection } = require('../../config/database');
const { verifyRole, getUser } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'POST,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['administrador','moderador']);
    const adminUser = getUser(event)?.email || 'admin@bj.mx';
    const { queueId } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    const reason = body.reason || 'Rechazado';

    const conn = await getConnection();
    const [[q]] = await conn.query(`SELECT * FROM ModeracionQueue WHERE id=? FOR UPDATE`, [queueId]);
    if (!q || q.status !== 'PENDING') return { statusCode:400, headers, body: JSON.stringify({ success:false, message:'No pendiente' }) };

    await conn.query(
      `UPDATE ModeracionQueue SET status='REJECTED', reviewedBy=?, reviewedAt=NOW(), reason=? WHERE id=?`,
      [adminUser, reason, queueId]
    );
    await conn.query(
      `INSERT INTO ModeracionLog(queueId,adminUser,action,reason) VALUES(?,?,'REJECTED',?)`,
      [queueId, adminUser, reason]
    );

    return { statusCode:200, headers, body: JSON.stringify({ success:true }) };
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
