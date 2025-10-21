// src/handlers/admin/toggle-beneficiario-status.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,PATCH',
  },
  body: JSON.stringify(body),
});

async function q(conn, sql, params = []) { const [rows] = await conn.query(sql, params); return rows; }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  let conn;
  try {
    verifyRole(event, ['administrador']);
    conn = await getConnection();

    const id = parseInt((event.pathParameters || {}).id, 10);
    if (!id) return json(400, { success: false, message: 'ID inválido' });

    const rows = await q(conn, `SELECT activo FROM \`Beneficiario\` WHERE idBeneficiario = ?`, [id]);
    if (!rows.length) return json(404, { success: false, message: 'Beneficiario no encontrado' });

    const newVal = rows[0].activo ? 0 : 1;
    await q(conn, `UPDATE \`Beneficiario\` SET activo = ? WHERE idBeneficiario = ?`, [newVal, id]);

    return json(200, { success: true, idBeneficiario: id, activo: !!newVal });
  } catch (err) {
    console.error('toggle-beneficiario-status error:', err);
    const msg = err?.message || 'No se pudo cambiar el estado';
    const code = String(msg).includes('Token') ? 401 : 500;
    return json(code, { success: false, message: msg });
  }
};
