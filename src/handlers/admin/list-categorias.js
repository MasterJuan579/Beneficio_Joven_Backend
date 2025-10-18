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

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Verificar que sea administrador
    const user = verifyRole(event, ['administrador']);
    
    console.log(`Admin ${user.id} solicitó lista de categorías`);

    const connection = await getConnection();

    // Obtener todas las categorías
    const [categorias] = await connection.execute(`
      SELECT 
        idCategoria,
        nombre AS nombreCategoria
      FROM Categoria
      ORDER BY nombre ASC
    `);

    console.log(`Se encontraron ${categorias.length} categorías`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: categorias
      })
    };

  } catch (error) {
    console.error('Error obteniendo categorías :( ): ', error);

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