const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['dueno','administrador']);
    const { id } = event.pathParameters || {}; // idSucursal
    const status = (event.queryStringParameters?.status || 'ALL').toUpperCase();

    const conn = await getConnection();
    let sql = `
      SELECT p.idPromocion, p.titulo, p.descripcion, p.status, p.unlimited,
             p.limitQuantity, p.redeemedCount, p.validFrom, p.validTo,
             p.discountType, p.discountValue, p.idCategoriaCupon
      FROM Promocion p
      WHERE p.idSucursal = ?
    `;
    const params = [id];
    if (status !== 'ALL') { sql += ' AND p.status = ?'; params.push(status); }
    sql += ' ORDER BY p.fechaRegistro DESC';

    const [rows] = await conn.query(sql, params);
    return { statusCode:200, headers, body: JSON.stringify({ success:true, data: rows }) };
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
