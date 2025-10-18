// src/handlers/admin/admin-beneficiarios.js
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
    // ADMIN o MODERADOR pueden leer
    verifyRole(event, ['administrador','moderador']);
    conn = await getConnection();

    const qs = event.queryStringParameters || {};
    const page = Math.max(1, parseInt(qs.page || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(qs.pageSize || '20', 10)));
    const offset = (page - 1) * pageSize;
    const query = (qs.query || '').trim();

    // Búsqueda básica por nombre, CURP, email, folio
    const where = [];
    const params = [];

    if (query) {
      const like = `%${query}%`;
      where.push(`(primerNombre LIKE ? OR segundoNombre LIKE ? OR apellidoPaterno LIKE ? OR apellidoMaterno LIKE ? OR curp LIKE ? OR email LIKE ? OR folio LIKE ?)`);
      params.push(like, like, like, like, like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalRows = await runSafe(conn, `
      SELECT COUNT(*) AS total
      FROM \`Beneficiario\`
      ${whereSql}
    `, params);

    const rows = await runSafe(conn, `
      SELECT idBeneficiario, curp, primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno,
             fechaNacimiento, celular, folio, email, fechaRegistro, sexo, activo
      FROM \`Beneficiario\`
      ${whereSql}
      ORDER BY fechaRegistro DESC, idBeneficiario DESC
      LIMIT ? OFFSET ?
    `, [...params, pageSize, offset]);

    return json(200, {
      success: true,
      data: rows,
      meta: { page, pageSize, total: totalRows[0]?.total ?? 0 }
    });

  } catch (err) {
    console.error('admin-beneficiarios error:', err);
    const msg = err?.message || 'Error listando beneficiarios';
    if (/Token|Acceso denegado/i.test(msg)) return json(401, { success:false, message: msg });
    return json(500, { success:false, message: msg });
  }
};
