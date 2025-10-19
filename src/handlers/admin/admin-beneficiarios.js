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

async function q(conn, sql, params = []) {
  const [rows] = await conn.query(sql, params);
  return rows;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  let conn;
  try {
    // Solo admins
    verifyRole(event, ['administrador']);
    conn = await getConnection();

    const qs = event.queryStringParameters || {};
    const search = (qs.query || '').trim();
    const showInactive = qs.showInactive === '1' || qs.showInactive === 'true';
    const limit = Math.min(parseInt(qs.limit || '200', 10), 500);
    const offset = Math.max(parseInt(qs.offset || '0', 10), 0);
    const sort = (qs.sort || 'fechaRegistro').toString();
    const dir = (qs.dir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Campos permitidos para sort (white-list)
    const sortMap = {
      fechaRegistro: '`fechaRegistro`',
      primerNombre: '`primerNombre`',
      apellidoPaterno: '`apellidoPaterno`',
      email: '`email`',
      curp: '`curp`',
      folio: '`folio`',
      activo: '`activo`'
    };
    const orderBy = sortMap[sort] || '`fechaRegistro`';

    const where = [];
    const params = [];

    if (!showInactive) {
      where.push('b.activo = 1');
    }
    if (search) {
      const like = `%${search}%`;
      where.push(`(
        b.primerNombre LIKE ? OR
        b.segundoNombre LIKE ? OR
        b.apellidoPaterno LIKE ? OR
        b.apellidoMaterno LIKE ? OR
        b.email LIKE ? OR
        b.curp LIKE ? OR
        b.folio LIKE ?
      )`);
      params.push(like, like, like, like, like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const data = await q(conn, `
      SELECT
        b.idBeneficiario,
        b.primerNombre,
        b.segundoNombre,
        b.apellidoPaterno,
        b.apellidoMaterno,
        b.curp,
        b.email,
        b.folio,
        b.fechaRegistro,
        b.activo
      FROM \`Beneficiario\` b
      ${whereSql}
      ORDER BY ${orderBy} ${dir}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const [{ total }] = await q(conn, `
      SELECT COUNT(*) AS total FROM \`Beneficiario\` b
      ${whereSql}
    `, params);

    return json(200, { success: true, data, total, limit, offset });

  } catch (err) {
    console.error('admin-beneficiarios error:', err);
    const msg = err?.message || 'Error listando beneficiarios';
    const code = String(msg).includes('Token') ? 401 : 500;
    return json(code, { success: false, message: msg });
  }
};
