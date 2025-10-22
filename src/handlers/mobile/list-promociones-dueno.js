// src/handlers/mobile/list-promociones-dueno.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

/**
 * GET /mobile/promociones-establecimiento-dueno?idDueno=1&page=1&pageSize=20
 * Retorna promociones vigentes/activas del establecimiento del dueño.
 */
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
      verifyRole(event, ['dueno']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    const q = event.queryStringParameters || {};
    const idDueno = Number(q.idDueno);
    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(q.pageSize || '20', 10), 1), 100);
    const offset = (page - 1) * pageSize;

    if (!idDueno || Number.isNaN(idDueno)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Parámetro idDueno requerido' }),
      };
    }

    const conn = await getConnection();

    // Obtener el idEstablecimiento asociado al dueño
    const [establecimientoRows] = await conn.execute(
      `SELECT idEstablecimiento FROM DuenoEstablecimiento WHERE idDueno = ?`,
      [idDueno]
    );

    if (establecimientoRows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'Dueño no asociado a ningún establecimiento' }),
      };
    }

    const idEstablecimiento = establecimientoRows[0].idEstablecimiento;

    // Total (para paginación)
    const [countRows] = await conn.execute(`
      SELECT COUNT(*) AS total
      FROM Promocion p
      JOIN Establecimiento e ON e.idEstablecimiento = p.idEstablecimiento
      WHERE p.idEstablecimiento = ?
        AND e.activo = 1
        AND p.esVigente = 1
        AND (p.status IS NULL OR p.status = 'APPROVED') -- también mostrar las PENDING
        AND (p.validFrom IS NULL OR p.validFrom <= NOW())
        AND (p.validTo   IS NULL OR p.validTo   >= NOW())
      `, [idEstablecimiento]
    );
    const total = countRows?.[0]?.total || 0;

    // Datos
    const [rows] = await conn.execute(`
      SELECT
        p.idPromocion,
        p.idEstablecimiento,
        e.nombre AS establecimiento,
        e.logoURL AS establecimientoLogoURL,
        p.titulo,
        p.descripcion,
        p.imagenURL,
        p.validFrom,
        p.validTo,
        p.esVigente,
        p.status,
        p.fechaRegistro
      FROM Promocion p
      JOIN Establecimiento e ON e.idEstablecimiento = p.idEstablecimiento
      WHERE p.idEstablecimiento = ?
        AND e.activo = 1
        AND p.esVigente = 1
        AND (p.status IS NULL OR p.status = 'APPROVED')
        AND (p.validFrom IS NULL OR p.validFrom <= NOW())
        AND (p.validTo   IS NULL OR p.validTo   >= NOW())
      ORDER BY p.fechaRegistro DESC
      LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}
      `, [idEstablecimiento]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        page,
        pageSize,
        total,
        items: rows.map(r => ({
          idPromocion: r.idPromocion,
          idEstablecimiento: r.idEstablecimiento,
          establecimiento: r.establecimiento,
          establecimientoLogoURL: r.establecimientoLogoURL,
          titulo: r.titulo,
          descripcion: r.descripcion,
          imagenURL: r.imagenURL,
          validFrom: r.validFrom,
          validTo: r.validTo,
          esVigente: r.esVigente,
          status: r.status,
          fechaRegistro: r.fechaRegistro
        })),
      }),
    };
  } catch (err) {
    console.error('[promociones-establecimiento] error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error interno',
        detail: process.env.NODE_ENV === 'development' ? String(err) : undefined,
      }),
    };
  }
};
