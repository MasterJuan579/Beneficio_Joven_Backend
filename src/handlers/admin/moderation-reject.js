require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const user = verifyRole(event, ['administrador']);
    const idPromocion = event.pathParameters?.queueId;

    if (!idPromocion) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'ID de promoción no proporcionado' }),
      };
    }

    const connection = await getConnection();

    const [promo] = await connection.execute(
      'SELECT idPromocion, status FROM Promocion WHERE idPromocion = ? LIMIT 1',
      [idPromocion]
    );

    if (promo.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'Promoción no encontrada' }) };
    }

    if (promo[0].status !== 'PENDING') {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'La promoción no está pendiente' }) };
    }

    await connection.execute(
      'UPDATE Promocion SET status = "REJECTED" WHERE idPromocion = ?',
      [idPromocion]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Promoción rechazada correctamente' }),
    };

  } catch (error) {
    console.error('❌ Error al rechazar promoción:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Error al rechazar promoción', error: error.message }),
    };
  }
};
