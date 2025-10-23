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
    verifyRole(event, ['administrador']);
    const queueId = event.pathParameters?.queueId;
    const body = JSON.parse(event.body || '{}');
    const { justificacion } = body;

    if (!queueId) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'ID no proporcionado' }) };
    }

    if (!justificacion || justificacion.trim().length < 5) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Se requiere una justificación válida' }) };
    }

    const connection = await getConnection();

    await connection.execute(
      'UPDATE Promocion SET status = "REJECTED", adminJustificacion = ? WHERE idPromocion = ?',
      [justificacion.trim(), queueId]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Promoción rechazada con justificación registrada' }),
    };
  } catch (error) {
    console.error('❌ Error al rechazar promoción:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Error al rechazar la promoción', error: error.message }),
    };
  }
};
