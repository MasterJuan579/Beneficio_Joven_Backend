// src/handlers/admin/admin-auditoria.js
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  let conn;
  try {
    verifyRole(event, ['administrador','moderador']);
    conn = await getConnection();

    const qs = event.queryStringParameters || {};
    const limit = Math.min(500, Math.max(1, parseInt(qs.limit || '100', 10)));

    const rows = await runSafe(conn, `
      SELECT id, actorUser, actorRole, action, entityType, entityId, created_at
      FROM \`AuditEvents\`
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `, [limit]);

    return json(200, { success: true, data: rows });
  } catch (err) {
    console.error('admin-auditoria error:', err);
    const msg = err?.message || 'Error listando eventos de auditoría';
    if (/Token|Acceso denegado/i.test(msg)) return json(401, { success:false, message: msg });
    return json(500, { success:false, message: msg });
  }
};
