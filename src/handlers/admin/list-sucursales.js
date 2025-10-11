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
    
    console.log(`Admin ${user.id} solicitó lista de sucursales`);

    const connection = await getConnection();

    // Query para obtener todas las sucursales con su información relacionada
    const [sucursales] = await connection.execute(`
      SELECT 
        s.idSucursal,
        s.nombre AS nombreSucursal,
        s.numSucursal,
        s.direccion,
        s.latitud,
        s.longitud,
        s.horaApertura,
        s.horaCierre,
        e.idEstablecimiento,
        e.logoURL,
        GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categorias,
        GROUP_CONCAT(DISTINCT d.idDueno) AS idsDuenos,
        GROUP_CONCAT(DISTINCT d.nombreUsuario SEPARATOR ', ') AS nombresDuenos,
        s.fechaRegistro
      FROM Sucursal s
      INNER JOIN Establecimiento e ON s.idEstablecimiento = e.idEstablecimiento
      LEFT JOIN CategoriaEstablecimiento ce ON e.idEstablecimiento = ce.idEstablecimiento
      LEFT JOIN Categoria c ON ce.idCategoria = c.idCategoria
      LEFT JOIN DuenoEstablecimiento de ON e.idEstablecimiento = de.idEstablecimiento
      LEFT JOIN Dueno d ON de.idDueno = d.idDueno
      GROUP BY s.idSucursal, s.nombre, s.numSucursal, s.direccion, s.latitud, s.longitud, 
               s.horaApertura, s.horaCierre, e.idEstablecimiento, e.logoURL, s.fechaRegistro
      ORDER BY s.fechaRegistro DESC
    `);

    // Obtener el total de sucursales
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM Sucursal'
    );

    // Formatear los datos
    const data = sucursales.map(sucursal => ({
      idSucursal: sucursal.idSucursal,
      nombreSucursal: sucursal.nombreSucursal,
      numSucursal: sucursal.numSucursal,
      nombreComercio: sucursal.nombreSucursal,
      direccion: sucursal.direccion,
      ubicacion: {
        latitud: sucursal.latitud ? parseFloat(sucursal.latitud) : null,
        longitud: sucursal.longitud ? parseFloat(sucursal.longitud) : null
      },
      horario: {
        apertura: sucursal.horaApertura,
        cierre: sucursal.horaCierre
      },
      establecimiento: {
        idEstablecimiento: sucursal.idEstablecimiento,
        logoURL: sucursal.logoURL
      },
      categoria: sucursal.categorias || 'Sin categoría',
      duenos: sucursal.nombresDuenos ? sucursal.nombresDuenos.split(', ') : [],
      idsDuenos: sucursal.idsDuenos ? sucursal.idsDuenos.split(',').map(id => parseInt(id)) : [],
      activo: true,
      fechaRegistro: sucursal.fechaRegistro
    }));

    console.log(`Se encontraron ${data.length} sucursales`);

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
    console.error('Error obteniendo sucursales:', error);

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
        message: 'Error al obtener sucursales',
        error: error.message
      })
    };
  }
};