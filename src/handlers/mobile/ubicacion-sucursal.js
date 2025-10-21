require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    try {
      verifyRole(event, ['beneficiario', 'dueno', 'administrador']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    const conn = await getConnection();
    // Necesito devolver una lista completa de sucursales incluyendo el nombre, la latitud, la longitud, y la hora de apertura y cierre
    const [rows] = await conn.execute(`
      SELECT
        s.idSucursal,
        s.nombre,
        s.latitud,
        s.longitud,
        s.horaApertura,
        s.horaCierre
      FROM Sucursal s
      WHERE s.activo = 1
    `);

    const data = rows.map(r => ({
      idSucursal: r.idSucursal,
      nombre: r.nombre,
      latitud: r.latitud,
      longitud: r.longitud,
      horaApertura: r.horaApertura,
      horaCierre: r.horaCierre
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };

  } catch (err) {
    console.error('ubicacion-sucursal (mobile) error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message || 'Server error' }) };
  }
};

