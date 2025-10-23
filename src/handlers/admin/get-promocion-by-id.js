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
    verifyRole(event, ['administrador']);
    const idPromocion = event.pathParameters?.id;

    if (!idPromocion) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'ID de promoción no proporcionado',
        }),
      };
    }

    const connection = await getConnection();

    const [rows] = await connection.execute(
      `
      SELECT
        p.idPromocion,
        p.idEstablecimiento,
        p.titulo,
        p.descripcion,
        p.status,
        p.discountType,
        p.discountValue,
        p.validFrom,
        p.validTo,
        p.esVigente,
        e.nombre AS nombreEstablecimiento,
        e.logoURL AS establecimientoLogoURL
      FROM Promocion p
      INNER JOIN Establecimiento e 
        ON e.idEstablecimiento = p.idEstablecimiento
      WHERE p.idPromocion = ?
      LIMIT 1
      `,
      [idPromocion]
    );

    if (rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Promoción no encontrada',
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: rows[0],
      }),
    };
  } catch (error) {
    console.error('❌ Error al obtener detalles de la promoción:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al obtener detalles de la promoción',
        error: error.message,
      }),
    };
  }
};
