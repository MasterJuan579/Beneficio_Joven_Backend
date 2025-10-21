const { getConnection } = require('../../config/database');
const { verifyRole, getUser } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['dueno','administrador']);
    const { id } = event.pathParameters || {};
    const conn = await getConnection();

    const [[row]] = await conn.query(`
      SELECT s.*, e.nombre AS nombreEstablecimiento
      FROM Sucursal s
      JOIN Establecimiento e USING(idEstablecimiento)
      WHERE s.idSucursal = ?
    `, [id]);
    if (!row) return { statusCode:404, headers, body: JSON.stringify({ success:false, message:'Sucursal no existe' }) };

    // (opcional) validar que el dueño sea dueño de ese establecimiento
    return { statusCode:200, headers, body: JSON.stringify({ success:true, data: row }) };
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
