// src/handlers/mobile/list-promociones.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

/**
 * GET /mobile/promociones-establecimiento?idEstablecimiento=12&page=1&pageSize=20
 * Retorna promociones vigentes/activas de un establecimiento.
 */
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
    // Auth (usa los mismos roles que en tus otros endpoints móviles)
    try {
      verifyRole(event, ['beneficiario', 'dueno', 'administrador']);
    } catch (e) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }),
      };
    }

    const qs = event.queryStringParameters || {};
    const idEstablecimiento = Number(qs.idEstablecimiento);
    const page = Math.max(1, Number(qs.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(qs.pageSize || 20))); // hard limit

    if (!idEstablecimiento || Number.isNaN(idEstablecimiento)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Parámetro idEstablecimiento requerido' }),
      };
    }

    const offset = (page - 1) * pageSize;

    const conn = await getConnection();

    // Total (para paginación)
    const [countRows] = await conn.execute(
      `
      SELECT COUNT(*) AS total
      FROM Promocion p
      JOIN Establecimiento e ON e.idEstablecimiento = p.idEstablecimiento
      WHERE p.idEstablecimiento = ?
        AND e.activo = 1
        AND p.esVigente = 1
        AND (p.status IS NULL OR p.status = 'ACTIVA')
        AND (p.validFrom IS NULL OR p.validFrom <= NOW())
        AND (p.validTo   IS NULL OR p.validTo   >= NOW())
      `,
      [idEstablecimiento]
    );
    const total = countRows?.[0]?.total || 0;

    // Datos
    const [rows] = await conn.execute(
      `
      SELECT
        p.idPromocion,
        p.idEstablecimiento,
        e.nombre                     AS establecimiento,
        e.logoURL                    AS establecimientoLogoURL,
        p.titulo,
        p.descripcion,
        p.imagenURL,
        p.discountType,
        p.discountValue,
        p.limitQuantity,
        p.unlimited,
        p.validFrom,
        p.validTo,
        p.esVigente,
        p.status,
        p.fechaRegistro,
        p.redeemedCount,
        p.idSucursal,
        p.idCategoriaCupon
      FROM Promocion p
      JOIN Establecimiento e ON e.idEstablecimiento = p.idEstablecimiento
      WHERE p.idEstablecimiento = ?
        AND e.activo = 1
        AND p.esVigente = 1
        AND (p.status IS NULL OR p.status = 'ACTIVA')
        AND (p.validFrom IS NULL OR p.validFrom <= NOW())
        AND (p.validTo   IS NULL OR p.validTo   >= NOW())
      ORDER BY p.fechaRegistro DESC
      LIMIT ? OFFSET ?
      `,
      [idEstablecimiento, pageSize, offset]
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
          discountType: r.discountType,     // 'PORCENTAJE' | 'MONTO' | 'OTRO'
          discountValue: Number(r.discountValue || 0),
          limitQuantity: r.limitQuantity,
          unlimited: !!r.unlimited,
          validFrom: r.validFrom,
          validTo: r.validTo,
          vigente: !!r.esVigente,
          status: r.status,                 // 'ACTIVA' (según tu enum)
          redeemedCount: r.redeemedCount || 0,
          idSucursal: r.idSucursal,
          idCategoriaCupon: r.idCategoriaCupon,
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
