// src/handlers/admin/reports.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
  },
  body: JSON.stringify(body),
});

// Si una tabla opcional no existe, devolvemos filas vacías
async function runSafe(conn, sql) {
  try {
    const [rows] = await conn.query(sql);
    return rows;
  } catch (e) {
    console.warn('Query opcional falló:', e.message);
    return [];
  }
}

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  let conn;
  try {
    // Solo administradores
    verifyRole(event, ['administrador']);

    conn = await getConnection();

    // === Beneficiarios ===
    const [rowsTotalBenef] = await conn.query(`
      SELECT COUNT(*) AS total FROM \Beneficiario\
    `);

    const [rowsNuevos30d] = await conn.query(`
      SELECT COUNT(*) AS total
      FROM \Beneficiario\
      WHERE fechaRegistro >= NOW() - INTERVAL 30 DAY
    `);

    // === Comercios / Sucursales ===
    const [rowsTotalEstab] = await conn.query(`
      SELECT COUNT(*) AS total FROM \Establecimiento\
    `);

    // Establecimientos con al menos una sucursal activa
    const [rowsEstabActivos] = await conn.query(`
      SELECT COUNT(DISTINCT s.idEstablecimiento) AS activos
      FROM \Sucursal\ s
      WHERE s.activo = 1
    `);

    // Establecimientos sin sucursales activas
    const [rowsEstabSuspendidos] = await conn.query(`
      SELECT COUNT(*) AS suspendidos
      FROM \Establecimiento\ e
      LEFT JOIN (
        SELECT DISTINCT idEstablecimiento
        FROM \Sucursal\
        WHERE activo = 1
      ) a ON a.idEstablecimiento = e.idEstablecimiento
      WHERE a.idEstablecimiento IS NULL
    `);

    const [rowsSucursales] = await conn.query(`
      SELECT COUNT(*) AS total FROM \Sucursal\
    `);

    const [rowsSucActivas] = await conn.query(`
      SELECT COUNT(*) AS activas FROM \Sucursal\ WHERE activo = 1
    `);

    const [rowsSucInactivas] = await conn.query(`
      SELECT COUNT(*) AS inactivas FROM \Sucursal\ WHERE activo = 0
    `);

    // === Promociones ===
    const [rowsPromosTotal] = await conn.query(`
      SELECT COUNT(*) AS total FROM \Promocion\
    `);

    const [rowsPromosVig] = await conn.query(`
      SELECT COUNT(*) AS vigentes
      FROM \Promocion\
      WHERE esVigente = 1
    `);

    // === Aplicaciones de promoción ===
    const [rowsAppsTotal] = await conn.query(`
      SELECT COUNT(*) AS totalApps FROM \AplicacionPromocion\
    `);

    // Series: aplicaciones por mes (últimos 6)
    const rowsAppsPorMes = await runSafe(conn, `
      SELECT
        DATE_FORMAT(fechaAplicacion,'%Y-%m') AS ym,
        COUNT(*) AS aplicaciones
      FROM \AplicacionPromocion\
      WHERE fechaAplicacion >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 5 MONTH)
      GROUP BY ym
      ORDER BY ym ASC
    `);

    // Top 5 establecimientos por aplicaciones
    const rowsTopEstab = await runSafe(conn, `
      SELECT e.idEstablecimiento, e.idEstablecimiento AS codigo, 
             COUNT(*) AS aplicaciones
      FROM \AplicacionPromocion\ ap
      JOIN \Promocion\ p       ON p.idPromocion = ap.idPromocion
      JOIN \Establecimiento\ e ON e.idEstablecimiento = p.idEstablecimiento
      GROUP BY e.idEstablecimiento
      ORDER BY aplicaciones DESC
      LIMIT 5
    `);

    // Top categorías (si existen)
    const rowsTopCategorias = await runSafe(conn, `
      SELECT c.nombre AS categoria, COUNT(*) AS establecimientos
      FROM \CategoriaEstablecimiento\ ce
      JOIN \Categoria\ c ON c.idCategoria = ce.idCategoria
      GROUP BY c.nombre
      ORDER BY establecimientos DESC
      LIMIT 5
    `);

    // Moderación / Auditoría (opcionales)
    const rowsModeracion = await runSafe(conn, `
      SELECT
        SUM(estado='PENDIENTE') AS pendientes,
        SUM(estado='APROBADO')  AS aprobados,
        SUM(estado='RECHAZADO') AS rechazados,
        COUNT(*)                AS total
      FROM \Moderacion\
    `);

    const rowsAudit = await runSafe(conn, `
      SELECT id, fecha, usuario, accion, entidad, detalle
      FROM \AuditLog\
      ORDER BY fecha DESC
      LIMIT 10
    `);

    const moderacion = rowsModeracion.length
      ? rowsModeracion[0]
      : { total: 0, pendientes: 0, aprobados: 0, rechazados: 0 };

    const data = {
      kpis: {
        beneficiarios: {
          total: rowsTotalBenef[0]?.total || 0,
          nuevos30d: rowsNuevos30d[0]?.total || 0,
        },
        comercios: {
          total: rowsTotalEstab[0]?.total || 0,
          activos: rowsEstabActivos[0]?.activos || 0,
          suspendidos: rowsEstabSuspendidos[0]?.suspendidos || 0,
          sucursales: rowsSucursales[0]?.total || 0,
          sucursalesActivas: rowsSucActivas[0]?.activas || 0,
          sucursalesInactivas: rowsSucInactivas[0]?.inactivas || 0,
        },
        promociones: {
          total: rowsPromosTotal[0]?.total || 0,
          vigentes: rowsPromosVig[0]?.vigentes || 0,
          // Compatibilidad con la UI anterior:
          activas: rowsPromosVig[0]?.vigentes || 0,
          pausadas: 0,
          eliminadas: 0,
          vigentesHoy: rowsPromosVig[0]?.vigentes || 0,
        },
        aplicaciones: {
          total: rowsAppsTotal[0]?.totalApps || 0,
          // No existe "ahorro" en tu modelo:
          ahorroTotal: 0,
          ahorro30d: 0,
        },
        moderacion,
      },
      series: {
        aplicacionesPorMes: rowsAppsPorMes,  // [{ym, aplicaciones}]
        topEstablecimientos: rowsTopEstab,   // [{idEstablecimiento, codigo, aplicaciones}]
        topCategorias: rowsTopCategorias,    // [{categoria, establecimientos}]
      },
      auditoria: rowsAudit,                  // []
    };

    return json(200, { success: true, data });
  } catch (err) {
    console.error('Admin reports error:', err);
    const message = err?.message || 'Error generando reportes';
    if (message.includes('Token') || message.includes('Acceso denegado')) {
      return json(401, { success: false, message });
    }
    return json(500, { success: false, message });
  } finally {
    try { if (conn?.release) conn.release(); } catch {}
  }
};