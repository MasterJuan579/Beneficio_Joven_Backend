require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Solo administradores pueden ver las promociones
    const user = verifyRole(event, ['administrador']);
    console.log(`👤 Admin ${user.id} accede al listado de moderación.`);

    const connection = await getConnection();

    // Leer parámetro de filtro
    const status = event.queryStringParameters?.status || 'PENDING';

    const [rows] = await connection.execute(`
      SELECT 
        p.idPromocion,
        p.titulo,
        p.descripcion,
        p.discountType,
        p.discountValue,
        p.validFrom,
        p.validTo,
        p.imagenURL,
        p.status,
        e.idEstablecimiento,
        e.nombre AS nombreEstablecimiento,
        e.logoURL
      FROM Promocion p
      INNER JOIN Establecimiento e ON e.idEstablecimiento = p.idEstablecimiento
      WHERE p.status = ?
      ORDER BY p.fechaRegistro DESC
    `, [status]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: rows,
      }),
    };

  } catch (error) {
    console.error('❌ Error al listar promociones:', error);

    if (error.message.includes('Token') || error.message.includes('Acceso denegado')) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: error.message }) };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al obtener promociones',
        error: error.message,
      }),
    };
  }
};

