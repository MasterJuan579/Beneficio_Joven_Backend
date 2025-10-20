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

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Permitir también app móvil (beneficiario y dueño), sin romper admin
    const user = verifyRole(event, ['beneficiario', 'dueno', 'administrador']);
    // Nota: si tu JWT usa otro string para “dueño”, añade aquí.

    const connection = await getConnection();

    // Mantén los alias EXACTOS que consume Android: idCategoria, nombreCategoria
    const [categorias] = await connection.execute(`
      SELECT 
        idCategoria,
        nombre AS nombreCategoria
      FROM Categoria
      ORDER BY nombre ASC
    `);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: categorias
      })
    };

  } catch (error) {
    console.error('Error obteniendo categorías (mobile):', error);

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

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al obtener categorías',
        error: error.message
      })
    };
  }
};