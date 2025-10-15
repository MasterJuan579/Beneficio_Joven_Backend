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
    const user = verifyRole(event, ['administrador', 'dueno', 'beneficiario']);
    
    console.log(`Admin ${user.id} solicitó lista de establecimientos`);

    const connection = await getConnection();

    // Query simplificada usando e.nombre directamente
    const [establecimientos] = await connection.execute(`
      SELECT 
        e.idEstablecimiento,
        e.nombre AS nombreEstablecimiento,
        GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categoria
      FROM Establecimiento e
      LEFT JOIN CategoriaEstablecimiento ce ON e.idEstablecimiento = ce.idEstablecimiento
      LEFT JOIN Categoria c ON ce.idCategoria = c.idCategoria
      GROUP BY e.idEstablecimiento, e.nombre
      ORDER BY e.fechaRegistro DESC
    `);

    // Obtener total de establecimientos
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM Establecimiento'
    );

    // Formatear los datos
    const data = establecimientos.map(establecimiento => ({
      idEstablecimiento: establecimiento.idEstablecimiento,
      nombreEstablecimiento: establecimiento.nombreEstablecimiento,
      categoria: establecimiento.categoria || 'Sin categoría'
    }));

    console.log(`Se encontraron ${data.length} establecimientos`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data,
        total: totalResult[0].total
      })
    };

  } catch (error) {
    console.error('Error obteniendo establecimientos:', error);

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
        message: 'Error al obtener establecimientos',
        error: error.message
      })
    };
  }
};