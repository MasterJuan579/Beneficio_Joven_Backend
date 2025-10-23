require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

/**
 * API: Obtener usuario por folio
 * Método: GET
 * Parámetro: folio (query string)
 * Retorna: nombre y edad del usuario
 */
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  // Soporte CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Permitir roles válidos (ajusta según tu app)
    const user = verifyRole(event, ['beneficiario', 'dueno', 'administrador']);

    // Obtener el folio desde los parámetros del query string
    const folio = event.queryStringParameters?.folio;

    if (!folio) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Falta el parámetro "folio"'
        })
      };
    }

    const connection = await getConnection();

    // Consulta del usuario
    const [rows] = await connection.execute(`
    SELECT
        CONCAT_WS(' ', primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno) AS nombre,
        TIMESTAMPDIFF(YEAR, fechaNacimiento, CURDATE()) AS edad
    FROM Beneficiario
    WHERE folio = ?
    `, [folio]);

    if (rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Usuario no encontrado'
        })
      };
    }

    // Usuario encontrado
    const usuario = rows[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          nombre: usuario.nombre,
          edad: usuario.edad
        }
      })
    };

  } catch (error) {
    console.error('Error al obtener usuario por folio:', error);

    // Errores de autenticación
    if (error.message.includes('Token') || error.message.includes('Acceso denegado')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: error.message
        })
      };
    }

    // Errores genéricos
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error interno al obtener el usuario',
        error: error.message
      })
    };
  }
};