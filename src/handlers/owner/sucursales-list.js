const { getConnection } = require('../../config/database');
const { verifyRole, getUser } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,OPTIONS' };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    verifyRole(event, ['dueno','administrador']);
    const user = getUser(event); // asume { role, idDueno, email }
    const duenoId = user?.idDueno;

    const conn = await getConnection();
    // trae establecimientos del dueño y sus sucursales
    const [rows] = await conn.query(`
      SELECT s.idSucursal, s.idEstablecimiento, e.nombre AS establecimiento,
             s.nombre AS nombreSucursal, s.direccion, s.latitud, s.longitud,
             s.horaApertura, s.horaCierre, s.activo
      FROM DuenoEstablecimiento de
      JOIN Establecimiento e ON e.idEstablecimiento = de.idEstablecimiento
      JOIN Sucursal s        ON s.idEstablecimiento = e.idEstablecimiento
      WHERE de.idDueno = ?
      ORDER BY e.nombre, s.nombre
    `, [duenoId]);

    return { statusCode:200, headers, body: JSON.stringify({ success:true, data: rows }) };
  } catch (err) {
    return { statusCode:400, headers, body: JSON.stringify({ success:false, message: err.message }) };
  }
};
