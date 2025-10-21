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
    // Verificar autenticación (admin o dueño)
    const user = verifyRole(event, ['administrador', 'dueno']);

    // Obtener ID de la URL
    const idSucursal = event.pathParameters?.id;

    if (!idSucursal) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'ID de sucursal no proporcionado'
        })
      };
    }

    console.log(`👤 Usuario ${user.id} (${user.role}) consulta sucursal ${idSucursal}`);

    const connection = await getConnection();

    // Si es dueño, verificar que la sucursal le pertenece
    if (user.role === 'dueno') {
      const [ownership] = await connection.execute(`
        SELECT s.idSucursal 
        FROM Sucursal s
        JOIN DuenoEstablecimiento de ON s.idEstablecimiento = de.idEstablecimiento
        WHERE s.idSucursal = ? AND de.idDueno = ?
      `, [idSucursal, user.id]);

      if (ownership.length === 0) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'No tienes permiso para ver esta sucursal'
          })
        };
      }
    }

    // Obtener datos completos de la sucursal
    const [sucursales] = await connection.execute(`
      SELECT 
        s.idSucursal,
        s.idEstablecimiento,
        s.numSucursal,
        s.nombre AS nombreSucursal,
        s.direccion,
        s.latitud,
        s.longitud,
        s.horaApertura,
        s.horaCierre,
        s.activo,
        s.fechaRegistro,
        e.nombre AS nombreEstablecimiento,
        GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categoria
      FROM Sucursal s
      INNER JOIN Establecimiento e ON s.idEstablecimiento = e.idEstablecimiento
      LEFT JOIN CategoriaEstablecimiento ce ON e.idEstablecimiento = ce.idEstablecimiento
      LEFT JOIN Categoria c ON ce.idCategoria = c.idCategoria
      WHERE s.idSucursal = ?
      GROUP BY s.idSucursal, e.idEstablecimiento
    `, [idSucursal]);

    if (sucursales.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Sucursal no encontrada'
        })
      };
    }

    // Obtener imágenes de la sucursal
    const [imagenes] = await connection.execute(`
      SELECT 
        idImagen,
        urlImagen AS url,
        publicId,
        fechaRegistro
      FROM SucursalImagen
      WHERE idSucursal = ?
      ORDER BY fechaRegistro ASC
    `, [idSucursal]);

    const sucursal = {
      ...sucursales[0],
      imagenes: imagenes
    };

    console.log(`✅ Sucursal ${idSucursal} obtenida correctamente`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: sucursal
      })
    };

  } catch (error) {
    console.error('❌ Error obteniendo sucursal:', error);

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
        message: 'Error al obtener sucursal',
        error: error.message
      })
    };
  }
};