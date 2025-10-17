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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Método no permitido' }),
    };
  }

  try {
    const user = verifyRole(event, ['administrador', 'dueno']);
    console.log(`Usuario ${user.id} solicitando lista de sucursales`);

    const connection = await getConnection();

    const [rows] = await connection.execute(`
      SELECT 
        s.idSucursal,
        s.nombre AS nombreSucursal,
        s.direccion,
        s.latitud,
        s.longitud,
        s.horaApertura,
        s.horaCierre,
        s.activo,
        s.fechaRegistro,
        e.idEstablecimiento,
        e.nombre AS nombreEstablecimiento,
        GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categoria,
        (
          SELECT JSON_ARRAYAGG(urlImagen)
          FROM SucursalImagen si
          WHERE si.idSucursal = s.idSucursal
        ) AS imagenes
      FROM Sucursal s
      INNER JOIN Establecimiento e ON s.idEstablecimiento = e.idEstablecimiento
      LEFT JOIN CategoriaEstablecimiento ce ON e.idEstablecimiento = ce.idEstablecimiento
      LEFT JOIN Categoria c ON ce.idCategoria = c.idCategoria
      GROUP BY s.idSucursal, s.nombre, e.idEstablecimiento, e.nombre
      ORDER BY s.fechaRegistro DESC;
    `);


    const total = rows.length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sucursales obtenidas correctamente',
        total,
        data: rows.map((s) => ({
          ...s,
          imagenes: (() => {
            try {
              return s.imagenes ? JSON.parse(s.imagenes) : [];
            } catch (err) {
              console.warn(`⚠️ Imagenes inválidas para sucursal ${s.idSucursal}:`, s.imagenes);
              return [];
            }
          })(),
        })),
      }),
    };
  } catch (error) {
    console.error('❌ Error al obtener sucursales:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al obtener sucursales',
        error: error.message,
      }),
    };
  }
};
