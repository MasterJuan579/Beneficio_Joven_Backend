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
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    // beneficiario/dueno/admin pueden consumir
    verifyRole(event, ['beneficiario', 'dueno', 'administrador']);

    const q = event.queryStringParameters || {};
    const search = (q.q || '').trim();
    // categoryIds = "1,2,3"
    const categoryIds = (q.categoryIds || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter(n => Number.isInteger(n));

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(q.pageSize || '20', 10), 1), 100);
    const offset = (page - 1) * pageSize;

    const conn = await getConnection();

    // WHERE dinámico
    const where = ['e.activo = 1'];
    const params = [];

    if (search) {
      where.push('(e.nombre LIKE ?)');
      params.push(`%${search}%`);
    }
    if (categoryIds.length) {
      // al menos una de las categorías seleccionadas
      where.push(`
        EXISTS (
          SELECT 1
          FROM CategoriaEstablecimiento ce
          WHERE ce.idEstablecimiento = e.idEstablecimiento
            AND ce.idCategoria IN (${categoryIds.map(() => '?').join(',')})
        )
      `);
      params.push(...categoryIds);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // total
    const [[{ total }]] = await conn.execute(
      `SELECT COUNT(*) AS total
       FROM Establecimiento e
       ${whereSQL}`,
      params
    );

    // listado + categorías agregadas
    const [rows] = await conn.execute(
    `
    SELECT
        e.idEstablecimiento,
        e.nombre,
        e.logoURL,
    (
      SELECT GROUP_CONCAT(DISTINCT c.nombre ORDER BY c.nombre SEPARATOR ',')
      FROM CategoriaEstablecimiento ce
      JOIN Categoria c ON c.idCategoria = ce.idCategoria
      WHERE ce.idEstablecimiento = e.idEstablecimiento
    ) AS categorias
    FROM Establecimiento e
    ${whereSQL}         -- e.activo=1 + (q) + (EXISTS categorias) que ya construiste
    ORDER BY e.nombre
    LIMIT ? OFFSET ?
    `,
    [...params, pageSize, offset]
    );

    // normaliza categorias a arreglo
    const data = rows.map(r => ({
      idEstablecimiento: r.idEstablecimiento,
      nombre: r.nombre,
      logoURL: r.logoURL,
      categorias: r.categorias ? r.categorias.split(',') : []
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data,
        meta: { page, pageSize, total }
      })
    };
  } catch (err) {
    console.error('list-establecimientos (mobile) error:', err);
    const code = (err.message?.includes('Token') || err.message?.includes('Acceso denegado')) ? 401 : 500;
    return {
      statusCode: code,
      headers,
      body: JSON.stringify({ success: false, message: err.message || 'Server error' })
    };
  }
};
