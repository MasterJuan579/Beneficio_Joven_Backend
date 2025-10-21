// src/handlers/admin/admin-promociones.js
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
function range(col, from, to) {
  const parts = [], params = [];
  if (from) { parts.push(`${col} >= ?`); params.push(from); }
  if (to)   { parts.push(`${col} <  ?`); params.push(to); }
  return { where: parts.length ? ` AND ${parts.join(' AND ')}` : '', params };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  let conn;
  try {
    verifyRole(event, ['administrador','moderador']);
    conn = await getConnection();

    const qs = event.queryStringParameters || {};
    const status   = (qs.status || '').trim().toUpperCase(); // DRAFT|PENDING|APPROVED|REJECTED|PAUSED
    const estabId  = qs.idEstablecimiento ? parseInt(qs.idEstablecimiento,10) : null;
    const sucId    = qs.idSucursal ? parseInt(qs.idSucursal,10) : null;
    const catCupId = qs.idCategoriaCupon ? parseInt(qs.idCategoriaCupon,10) : null;
    const from     = qs.from || null; // YYYY-MM-DD
    const to       = qs.to   || null; // YYYY-MM-DD
    const page     = Math.max(1, parseInt(qs.page || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(qs.pageSize || '24', 10)));
    const offset   = (page - 1) * pageSize;

    const filters = [];
    const params  = [];

    if (status) { filters.push(`p.status = ?`); params.push(status); }
    if (estabId) { filters.push(`p.idEstablecimiento = ?`); params.push(estabId); }
    if (sucId) { filters.push(`p.idSucursal = ?`); params.push(sucId); }
    if (catCupId) { filters.push(`p.idCategoriaCupon = ?`); params.push(catCupId); }
    const rFrom = range('p.validFrom', from, to);
    if (rFrom.where) { filters.push(rFrom.where.replace(/^ AND /,'')); params.push(...rFrom.params); }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // Usamos la vista v_coupon_overview para enriquecer
    const totalRows = await runSafe(conn, `
      SELECT COUNT(*) AS total
      FROM \`Promocion\` p
      ${whereSql}
    `, params);

    const rows = await runSafe(conn, `
      SELECT
        p.idPromocion, p.idEstablecimiento, e.nombre AS establecimiento,
        p.titulo, p.descripcion, p.status, p.validFrom, p.validTo,
        p.discountType, p.discountValue, p.limitQuantity, p.unlimited,
        p.redeemedCount, p.idSucursal, s.nombre AS sucursalNombre,
        cc.nombre AS categoriaCupon
      FROM \`Promocion\` p
      JOIN \`Establecimiento\` e ON e.idEstablecimiento = p.idEstablecimiento
      LEFT JOIN \`Sucursal\` s ON s.idSucursal = p.idSucursal
      LEFT JOIN \`CategoriaCupon\` cc ON cc.idCategoriaCupon = p.idCategoriaCupon
      ${whereSql}
      ORDER BY p.fechaRegistro DESC, p.idPromocion DESC
      LIMIT ? OFFSET ?
    `, [...params, pageSize, offset]);

    return json(200, {
      success: true,
      data: rows,
      meta: { page, pageSize, total: totalRows[0]?.total ?? 0, filters: { status, estabId, sucId, catCupId, from, to } }
    });

  } catch (err) {
    console.error('admin-promociones error:', err);
    const msg = err?.message || 'Error listando promociones';
    if (/Token|Acceso denegado/i.test(msg)) return json(401, { success:false, message: msg });
    return json(500, { success:false, message: msg });
  }
};
