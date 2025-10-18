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
    const user = verifyRole(event, ['administrador', 'dueno', 'beneficiario']);
    console.log(` Usuario ${user.id} solicitó lista de establecimientos`);

    const connection = await getConnection();

    const [establecimientos] = await connection.execute(`
      SELECT 
        e.idEstablecimiento,
        e.nombre AS nombreEstablecimiento,
        e.logoURL,
        e.activo,
        e.fechaRegistro,
        GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categoria,
        d.idDueno,
        d.nombreUsuario AS nombreDueno,
        d.email AS correoDueno
      FROM Establecimiento e
      LEFT JOIN CategoriaEstablecimiento ce ON e.idEstablecimiento = ce.idEstablecimiento
      LEFT JOIN Categoria c ON ce.idCategoria = c.idCategoria
      LEFT JOIN DuenoEstablecimiento de ON e.idEstablecimiento = de.idEstablecimiento
      LEFT JOIN Dueno d ON de.idDueno = d.idDueno
      GROUP BY e.idEstablecimiento, e.nombre, d.idDueno, d.nombreUsuario, d.email
      ORDER BY e.fechaRegistro DESC;
    `);

    const total = establecimientos.length;

    const data = establecimientos.map((e) => ({
      idEstablecimiento: e.idEstablecimiento,
      nombreEstablecimiento: e.nombreEstablecimiento,
      categoria: e.categoria || 'Sin categoría',
      logoURL: e.logoURL || null,
      activo: !!e.activo,
      idDueno: e.idDueno || null,
      nombreDueno: e.nombreDueno || 'Sin asignar',
      correoDueno: e.correoDueno || null,
      fechaRegistro: e.fechaRegistro,
    }));

    console.log(`✅ Se encontraron ${data.length} establecimientos`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Establecimientos obtenidos correctamente',
        total,
        data,
      }),
    };
  } catch (error) {
    console.error('❌ Error obteniendo establecimientos:', error);

    if (
      error.message.includes('Token') ||
      error.message.includes('Acceso denegado')
    ) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: error.message,
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al obtener establecimientos',
        error: error.message,
      }),
    };
  }
};
