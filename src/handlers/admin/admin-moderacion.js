// src/handlers/admin/admin-moderacion.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
  },
  body: JSON.stringify(body),
});

async function q(conn, sql, params = []) { const [rows] = await conn.query(sql, params); return rows; }
async function runSafe(conn, sql, params = []) {
  try { return await q(conn, sql, params); }
  catch (e) { console.error('SQL error:', e?.code, e?.message, '\nSQL:', sql); return []; }
}

exports.queue = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  let conn;
  try {
    verifyRole(event, ['administrador','moderador']);
    conn = await getConnection();

    const qs = event.queryStringParameters || {};
    const status = (qs.status || '').trim().toUpperCase(); // PENDING|APPROVED|REJECTED|CANCELLED
    const filters = [];
    const params = [];
    if (status) { filters.push('status = ?'); params.push(status); }
    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const rows = await runSafe(conn, `
      SELECT id, entityType, entityId, submittedBy, action, status, reviewedBy, reviewedAt, reason, created_at
      FROM \`ModeracionQueue\`
      ${whereSql}
      ORDER BY 
        FIELD(status,'PENDING','APPROVED','REJECTED','CANCELLED'), 
        created_at DESC
      LIMIT 200
    `, params);

    return json(200, { success: true, data: rows });
  } catch (err) {
    console.error('admin-moderacion.queue error:', err);
    const msg = err?.message || 'Error listando cola de moderación';
    if (/Token|Acceso denegado/i.test(msg)) return json(401, { success:false, message: msg });
    return json(500, { success:false, message: msg });
  }
};

exports.rules = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  let conn;
  try {
    verifyRole(event, ['administrador','moderador']);
    conn = await getConnection();

    const rows = await runSafe(conn, `
      SELECT mr.idEstablecimiento, e.nombre AS establecimiento, mr.requireCouponApproval, mr.requireProfileApproval, mr.created_at
      FROM \`ModeracionRule\` mr
      JOIN \`Establecimiento\` e ON e.idEstablecimiento = mr.idEstablecimiento
      ORDER BY mr.created_at DESC
      LIMIT 500
    `);

    return json(200, { success: true, data: rows });
  } catch (err) {
    console.error('admin-moderacion.rules error:', err);
    const msg = err?.message || 'Error listando reglas';
    if (/Token|Acceso denegado/i.test(msg)) return json(401, { success:false, message: msg });
    return json(500, { success:false, message: msg });
  }
};
