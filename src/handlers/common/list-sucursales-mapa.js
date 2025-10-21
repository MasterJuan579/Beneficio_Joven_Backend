require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

/**
 * GET /common/mapa/sucursales
 * Devuelve todas las sucursales activas con su ubicación y datos para el mapa.
 * Permite filtrar por categoría (?categoria=ID) o búsqueda (?search=texto)
 */
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
    // Roles permitidos
    const user = verifyRole(event, ['administrador', 'dueno', 'beneficiario']);

    const params = event.queryStringParameters || {};
    const categoria = params.categoria || null;
    const search = params.search || null;

    const conn = await getConnection();

    // SQL base con JOIN correcto
    let query = `
      SELECT 
        s.idSucursal,
        s.nombre AS nombreSucursal,
        s.direccion,
        s.latitud,
        s.longitud,
        s.horaApertura,
        s.horaCierre,
        e.nombre AS establecimiento,
        e.logoURL,
        c.nombre AS categoria
      FROM Sucursal s
      INNER JOIN Establecimiento e ON s.idEstablecimiento = e.idEstablecimiento
      LEFT JOIN CategoriaEstablecimiento ce ON ce.idEstablecimiento = e.idEstablecimiento
      LEFT JOIN Categoria c ON c.idCategoria = ce.idCategoria
      WHERE s.activo = 1
    `;

    const paramsQuery = [];

    // Filtro por categoría
    if (categoria) {
      query += ' AND c.idCategoria = ?';
      paramsQuery.push(categoria);
    }

    // Filtro por búsqueda
    if (search) {
      query += ' AND (s.nombre LIKE ? OR e.nombre LIKE ?)';
      paramsQuery.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.nombre ASC';

    const [sucursales] = await conn.execute(query, paramsQuery);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: sucursales.length,
        data: sucursales
      })
    };

  } catch (error) {
    console.error('Error obteniendo sucursales para mapa:', error);

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
        message: 'Error al obtener sucursales del mapa',
        error: error.message
      })
    };
  }
};
