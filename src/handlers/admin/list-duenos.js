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
    
    console.log(`Admin ${user.id} solicitó lista de dueños`);

    const connection = await getConnection();

    // Query para obtener todos los dueños con la cantidad de establecimientos
    const [duenos] = await connection.execute(`
      SELECT 
        d.idDueno,
        d.email,
        d.nombreUsuario,
        d.fechaRegistro,
        COUNT(de.idEstablecimiento) AS cantidadEstablecimientos
      FROM Dueno d
      LEFT JOIN DuenoEstablecimiento de ON d.idDueno = de.idDueno
      GROUP BY d.idDueno, d.email, d.nombreUsuario, d.fechaRegistro
      ORDER BY d.fechaRegistro DESC
    `);

    // Obtener total de dueños
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM Dueno'
    );

    // Formatear los datos
    const data = duenos.map(dueno => ({
      idDueno: dueno.idDueno,
      email: dueno.email,
      nombreUsuario: dueno.nombreUsuario,
      fechaRegistro: dueno.fechaRegistro,
      activo: true, // Por defecto true, puedes agregar un campo en la tabla si lo necesitas
      cantidadEstablecimientos: dueno.cantidadEstablecimientos
    }));

    console.log(`Se encontraron ${data.length} dueños`);

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
    console.error('Error obteniendo dueños:', error);

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
        message: 'Error al obtener dueños',
        error: error.message
      })
    };
  }
};