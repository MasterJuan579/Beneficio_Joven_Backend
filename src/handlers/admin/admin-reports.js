// src/handlers/admin/admin-reports.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
  },
  body: JSON.stringify(body),
});

async function q(conn, sql, params = []) { const [rows] = await conn.query(sql, params); return rows; }
async function runSafe(conn, sql, params = []) {
  try { return await q(conn, sql, params); }
  catch (e) { console.error('SQL error:', e?.code, e?.message, '\nSQL:', sql); return []; }
}
function range(col, from, to) {
  const parts = [], params = [];
  if (from) { parts.push(`${col} >= ?`); params.push(from); }
  if (to)   { parts.push(`${col} <  ?`); params.push(to); }
  return { where: parts.length ? ` AND ${parts.join(' AND ')}` : '', params };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  // ⚠️ NO cerrar el pool en finally. getConnection() devuelve el pool reutilizable.
  let conn;
  try {
    verifyRole(event, ['administrador']);
    conn = await getConnection(); // <- es el pool

    const qs = event.queryStringParameters || {};
    const from = qs.from || null;    // YYYY-MM-DD
    const to   = qs.to   || null;    // YYYY-MM-DD
    const dbg  = qs.debug === '1';   // debug opcional

    // ===== DEBUG opcional =====
    let whereAmI = [];
    let tableCounts = [];
    if (dbg) {
      try {
        whereAmI = await q(conn, `
          SELECT DATABASE() AS db, @@hostname AS host, @@port AS port, @@version AS version, NOW() AS now;
        `);
      } catch (e) {
        whereAmI = [{ error: e?.message || String(e) }];
      }
      try {
        tableCounts = await q(conn, `
          SELECT 'Beneficiario' t, COUNT(*) c FROM Beneficiario
          UNION ALL SELECT 'AplicacionPromocion', COUNT(*) FROM AplicacionPromocion
          UNION ALL SELECT 'Promocion', COUNT(*) FROM Promocion
          UNION ALL SELECT 'Sucursal', COUNT(*) FROM Sucursal
          UNION ALL SELECT 'Establecimiento', COUNT(*) FROM Establecimiento
          UNION ALL SELECT 'ModeracionQueue', COUNT(*) FROM ModeracionQueue
        `);
      } catch (e) {
        tableCounts = [{ error: e?.message || String(e) }];
      }
    }

    // ===== Filtros para series =====
    const rAP = range('fechaAplicacion', from, to);
    const rAP2 = range('ap.fechaAplicacion', from, to);
    const rBen = range('fechaRegistro', from, to);
    const rPromFrom = range('validFrom', from, to);

    // ===== KPIs (todas safe) =====
    const benef = await runSafe(conn, `
      SELECT
        (SELECT COUNT(*) FROM \`Beneficiario\`) AS total,
        (SELECT COUNT(*) FROM \`Beneficiario\` WHERE fechaRegistro >= NOW() - INTERVAL 30 DAY) AS nuevos30d
    `);
    const comer = await runSafe(conn, `
      SELECT COUNT(*) AS total,
             SUM(activo=1) AS activos,
             SUM(activo=0) AS inactivos
      FROM \`Establecimiento\`
    `);
    const sucAct = await runSafe(conn, `SELECT SUM(activo=1) AS activas FROM \`Sucursal\``);
    const promos = await runSafe(conn, `
      SELECT
        COUNT(*) AS total,
        SUM(status='APPROVED') AS aprobadas,
        SUM(
          status='APPROVED'
          AND (validFrom IS NULL OR validFrom <= CURDATE())
          AND (validTo   IS NULL OR validTo   >= CURDATE())
        ) AS vigentesHoy
      FROM \`Promocion\`
    `);
    const apps = await runSafe(conn, `
      SELECT COUNT(*) AS totalUsos,
             SUM(fechaAplicacion >= NOW() - INTERVAL 30 DAY) AS usos30d
      FROM \`AplicacionPromocion\`
    `);
    const activ = await runSafe(conn, `
      SELECT
        (SELECT COUNT(*) FROM \`Beneficiario\`) AS total,
        (SELECT COUNT(DISTINCT idBeneficiario) FROM \`AplicacionPromocion\`) AS activos
    `);
    const moderNow = await runSafe(conn, `
      SELECT 
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, reviewedAt)),1) AS sla_media_min,
        MAX(TIMESTAMPDIFF(MINUTE, created_at, reviewedAt))         AS sla_max_min,
        SUM(status='PENDING')                                      AS pendientes
      FROM \`ModeracionQueue\`
    `);

    const kpis = {
      beneficiarios: {
        total: benef[0]?.total ?? 0,
        nuevos30d: benef[0]?.nuevos30d ?? 0,
      },
      comercios: {
        total: comer[0]?.total ?? 0,
        activos: comer[0]?.activos ?? 0,
        inactivos: comer[0]?.inactivos ?? 0,
        sucursalesActivas: sucAct[0]?.activas ?? 0,
      },
      promociones: {
        total: promos[0]?.total ?? 0,
        aprobadas: promos[0]?.aprobadas ?? 0,
        vigentes: promos[0]?.vigentesHoy ?? 0,
      },
      aplicaciones: {
        totalUsos: apps[0]?.totalUsos ?? 0,
        usos30d: apps[0]?.usos30d ?? 0,
      },
      activacion: {
        total: activ[0]?.total ?? 0,
        activos: activ[0]?.activos ?? 0,
        tasa: (activ[0]?.total ? (100 * (activ[0]?.activos || 0) / activ[0]?.total) : 0),
      },
      slaModeracion: (moderNow[0] || {}),
    };

    // ===== SERIES =====
    const aplicacionesPorMes = await runSafe(conn, `
      SELECT DATE_FORMAT(fechaAplicacion,'%Y-%m') AS ym, COUNT(*) AS aplicaciones
      FROM \`AplicacionPromocion\` WHERE 1=1 ${rAP.where}
      GROUP BY ym ORDER BY ym ASC
    `, rAP.params);

    const topEstablecimientos = await runSafe(conn, `
      SELECT e.idEstablecimiento, e.nombre, COUNT(*) AS aplicaciones
      FROM \`AplicacionPromocion\` ap
      JOIN \`Sucursal\` s ON s.idSucursal = ap.idSucursal
      JOIN \`Establecimiento\` e ON e.idEstablecimiento = s.idEstablecimiento
      WHERE 1=1 ${rAP2.where}
      GROUP BY e.idEstablecimiento, e.nombre
      ORDER BY aplicaciones DESC
      LIMIT 10
    `, rAP2.params);

    const topCategorias = await runSafe(conn, `
      SELECT c.nombre AS categoria, COUNT(*) AS establecimientos
      FROM \`CategoriaEstablecimiento\` ce
      JOIN \`Categoria\` c ON c.idCategoria = ce.idCategoria
      GROUP BY c.nombre
      ORDER BY establecimientos DESC
      LIMIT 10
    `);

    const redencionesPorMes = await runSafe(conn, `
      SELECT DATE_FORMAT(validFrom,'%Y-%m') AS mes, SUM(redeemedCount) AS redenciones
      FROM \`Promocion\`
      WHERE status='APPROVED' AND validFrom IS NOT NULL
      ${from ? ' AND validFrom >= ?' : ''} ${to ? ' AND validFrom < ?' : ''}
      GROUP BY mes ORDER BY mes ASC
    `, [ ...(from?[from]:[]), ...(to?[to]:[]) ]);

    const usosPorHora = await runSafe(conn, `
      SELECT DAYOFWEEK(fechaAplicacion) AS dow, HOUR(fechaAplicacion) AS hora, COUNT(*) AS usos
      FROM \`AplicacionPromocion\` WHERE 1=1 ${rAP.where}
      GROUP BY dow, hora ORDER BY dow, hora
    `, rAP.params);

    const usosPorDiaSemana = await runSafe(conn, `
      SELECT DAYNAME(fechaAplicacion) AS dia, COUNT(*) AS usos
      FROM \`AplicacionPromocion\` WHERE 1=1 ${rAP.where}
      GROUP BY dia
      ORDER BY FIELD(dia,'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')
    `, rAP.params);

    const crecimientoBeneficiarios = await runSafe(conn, `
      SELECT DATE_FORMAT(fechaRegistro,'%Y-%m') AS mes, COUNT(*) AS nuevos
      FROM \`Beneficiario\` WHERE 1=1 ${rBen.where}
      GROUP BY mes ORDER BY mes ASC
    `, rBen.params);

    const activacionPorMes = await runSafe(conn, `
      WITH bm AS (
        SELECT DATE_FORMAT(fechaRegistro,'%Y-%m') AS mes, idBeneficiario
        FROM \`Beneficiario\` WHERE 1=1 ${rBen.where}
      )
      SELECT bm.mes, COUNT(*) AS registrados, COUNT(DISTINCT ap.idBeneficiario) AS activados
      FROM bm
      LEFT JOIN \`AplicacionPromocion\` ap ON ap.idBeneficiario = bm.idBeneficiario
      GROUP BY bm.mes ORDER BY bm.mes ASC
    `, rBen.params);

    const promosStatus = await runSafe(conn, `
      SELECT status, SUM(unlimited=1) AS sinLimite, SUM(unlimited=0) AS conLimite, COUNT(*) AS total
      FROM \`Promocion\` GROUP BY status ORDER BY total DESC
    `);

    const topDuenos = await runSafe(conn, `
      SELECT d.idDueno, d.nombreUsuario, d.email,
             COUNT(DISTINCT e.idEstablecimiento) AS establecimientos,
             COUNT(DISTINCT s.idSucursal)        AS sucursales,
             COUNT(ap.idBeneficiario)            AS usos
      FROM \`Dueno\` d
      LEFT JOIN \`DuenoEstablecimiento\` de ON de.idDueno = d.idDueno
      LEFT JOIN \`Establecimiento\` e       ON e.idEstablecimiento = de.idEstablecimiento
      LEFT JOIN \`Sucursal\` s              ON s.idEstablecimiento = e.idEstablecimiento
      LEFT JOIN \`AplicacionPromocion\` ap  ON ap.idSucursal = s.idSucursal
      WHERE 1=1 ${rAP2.where}
      GROUP BY d.idDueno, d.nombreUsuario, d.email
      ORDER BY usos DESC
      LIMIT 10
    `, rAP2.params);

    // ===== 🆕 EXTRAS =====
    const embudoConversion = await runSafe(conn, `
      WITH ben AS (
        SELECT idBeneficiario, DATE_FORMAT(fechaRegistro,'%Y-%m') AS cohort
        FROM \`Beneficiario\` WHERE 1=1 ${rBen.where}
      ),
      use_counts AS (
        SELECT idBeneficiario, COUNT(*) AS usos
        FROM \`AplicacionPromocion\` GROUP BY idBeneficiario
      )
      SELECT cohort,
             COUNT(*) AS registrados,
             SUM(CASE WHEN usos >= 1 THEN 1 ELSE 0 END) AS activados_1p,
             SUM(CASE WHEN usos >= 3 THEN 1 ELSE 0 END) AS frecuentes_3p
      FROM ben
      LEFT JOIN use_counts USING(idBeneficiario)
      GROUP BY cohort
      ORDER BY cohort
    `, rBen.params);

    const slaModeracionTrend = await runSafe(conn, `
      SELECT DATE(created_at) AS fecha,
             ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, reviewedAt)),1) AS sla_media_min,
             SUM(status='PENDING') AS pendientes
      FROM \`ModeracionQueue\`
      GROUP BY DATE(created_at)
      ORDER BY fecha
    `);

    const catalogoLifecycle = await runSafe(conn, `
      SELECT DATE_FORMAT(fechaRegistro,'%Y-%m') AS mes,
             SUM(status='APPROVED') AS aprobadas,
             SUM(status='PENDING')  AS pendientes,
             SUM(status='PAUSED')   AS pausadas,
             COUNT(*)               AS total
      FROM \`Promocion\`
      GROUP BY mes
      ORDER BY mes
    `);

    const geoCobertura = await runSafe(conn, `
      SELECT cell_lat, cell_lng, branches, coupons, redemptions
      FROM \`v_geo_grid\`
    `);

    const auditoria = await runSafe(conn, `
      SELECT id, created_at, actorUser, actorRole, action, entityType, entityId
      FROM \`AuditEvents\` ORDER BY created_at DESC LIMIT 15
    `);

    // ===== Payload final =====
    const payload = {
      kpis,
      series: {
        aplicacionesPorMes,
        redencionesPorMes,
        topEstablecimientos,
        topCategorias,
        usosPorHora,
        usosPorDiaSemana,
        crecimientoBeneficiarios,
        activacionPorMes,
        promosStatus,
        topDuenos,

        // extras
        embudoConversion,
        slaModeracionTrend,
        catalogoLifecycle,
        geoCobertura,

        // snapshot SLA actual (útil como KPI o chip)
        slaModeracion: kpis.slaModeracion,
      },
      auditoria,
      filters: { from, to },
    };

    // Adjunta debug solo si se pidió
    if (dbg) payload.debug = { whereAmI, tableCounts };

    return json(200, { success: true, data: payload });

  } catch (err) {
    console.error('Admin reports error:', err);
    const msg = err?.message || 'Error generando reportes';
    if (String(msg).includes('Token') || String(msg).includes('Acceso denegado')) {
      return json(401, { success:false, message: msg });
    }
    return json(500, { success:false, message: msg });
  } finally {
    // 🔒 IMPORTANTE: NO cerrar el pool aquí.
    // getConnection() devuelve el pool global reutilizable.
    // Nada que hacer en finally.
  }
};
