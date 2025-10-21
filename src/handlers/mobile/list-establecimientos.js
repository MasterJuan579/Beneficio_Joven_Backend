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
    try {
      verifyRole(event, ['beneficiario', 'dueno', 'administrador']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    const q = event.queryStringParameters || {};
    const search = (q.q || '').trim();
    const categoryIds = (q.categoryIds || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(n => Number(n))
      .filter(Number.isInteger);

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(q.pageSize || '20', 10), 1), 100);
    const offset = (page - 1) * pageSize;

    const conn = await getConnection();

    // WHERE dinámico
    const where = ['e.activo = 1'];
    const params = [];
    if (search) { where.push('e.nombre LIKE ?'); params.push(`%${search}%`); }
    if (categoryIds.length) {
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
      `SELECT COUNT(*) AS total FROM Establecimiento e ${whereSQL}`,
      params
    );

    // listado + categorías agregadas
    const selectSQL = `
      SELECT
        e.idEstablecimiento,
        e.nombre,
        e.logoURL,
        GROUP_CONCAT(DISTINCT c.nombre ORDER BY c.nombre SEPARATOR ',') AS categorias
      FROM Establecimiento e
      LEFT JOIN CategoriaEstablecimiento ce ON ce.idEstablecimiento = e.idEstablecimiento
      LEFT JOIN Categoria c ON c.idCategoria = ce.idCategoria
      ${whereSQL}
      GROUP BY e.idEstablecimiento, e.nombre, e.logoURL
      ORDER BY e.nombre
      LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}
    `;

    console.log('list-establecimientos SQL:', selectSQL);
    console.log('list-establecimientos params:', params);

    const [rows] = await conn.execute(selectSQL, params);

    const data = rows.map(r => ({
      idEstablecimiento: r.idEstablecimiento,
      nombre: r.nombre,
      logoURL: r.logoURL,
      categorias: r.categorias ? r.categorias.split(',') : []
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data, meta: { page, pageSize, total } }) };

  } catch (err) {
    console.error('list-establecimientos (mobile) error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message || 'Server error' }) };
  }
};

