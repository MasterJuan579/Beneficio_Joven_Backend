// src/handlers/admin/admin-reports.js
require('dotenv').config();
const { getConnection } = require('../../src/config/database');
const { verifyRole } = require('../../src/middleware/auth');

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

async function q(conn, sql, params = []) {
  const [rows] = await conn.query(sql, params);
  return rows;
}
async function runSafe(conn, sql, params = []) {
  try { return await q(conn, sql, params); } catch { return []; }
}
function range(col, from, to) {
  const parts = [], params = [];
  if (from) { parts.push(`${col} >= ?`); params.push(from); }
  if (to)   { parts.push(`${col} <  ?`); params.push(to); }
  return { where: parts.length ? ` AND ${parts.join(' AND ')}` : '', params };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  let conn;
  try {
    verifyRole(event, ['administrador']);
    conn = await getConnection();

    const qs = event.queryStringParameters || {};
    const from = qs.from || null;           // 'YYYY-MM-DD'
    const to   = qs.to   || null;           // 'YYYY-MM-DD'

    // ===== KPIs =====
    const benef   = await q(conn, `
      SELECT
        (SELECT COUNT(*) FROM \`Beneficiario\`) AS total,
        (SELECT COUNT(*) FROM \`Beneficiario\` WHERE fechaRegistro >= NOW() - INTERVAL 30 DAY) AS nuevos30d
    `);
    const comer   = await q(conn, `
      SELECT COUNT(*) AS total, SUM(activo=1) AS activos, SUM(activo=0) AS inactivos
      FROM \`Establecimiento\`
    `);
    const suc     = await q(conn, `SELECT COUNT(*) AS total FROM \`Sucursal\``);
    const promos  = await q(conn, `
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
    const apps    = await q(conn, `
      SELECT COUNT(*) AS totalUsos,
             SUM(fechaAplicacion >= NOW() - INTERVAL 30 DAY) AS usos30d
      FROM \`AplicacionPromocion\`
    `);
    const activ   = await q(conn, `
      SELECT
        (SELECT COUNT(*) FROM \`Beneficiario\`) AS total,
        (SELECT COUNT(DISTINCT idBeneficiario) FROM \`AplicacionPromocion\`) AS activos
    `);
    const moderQ  = await runSafe(conn, `
      SELECT 
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, reviewedAt)),1) AS sla_media_min,
        MAX(TIMESTAMPDIFF(MINUTE, created_at, reviewedAt))         AS sla_max_min,
        SUM(status='PENDING')                                      AS pendientes
      FROM \`ModeracionQueue\`
    `);
    const kpis = {
      beneficiarios: { total: benef[0]?.total ?? 0, nuevos30d: benef[0]?.nuevos30d ?? 0 },
      comercios:     { total: comer[0]?.total ?? 0, activos: comer[0]?.activos ?? 0, inactivos: comer[0]?.inactivos ?? 0, sucursales: suc[0]?.total ?? 0 },
      promociones:   { total: promos[0]?.total ?? 0, aprobadas: promos[0]?.aprobadas ?? 0, vigentesHoy: promos[0]?.vigentesHoy ?? 0 },
      aplicaciones:  { totalUsos: apps[0]?.totalUsos ?? 0, usos30d: apps[0]?.usos30d ?? 0 },
      activacion:    {
        total: activ[0]?.total ?? 0,
        activos: activ[0]?.activos ?? 0,
        tasa: (activ[0]?.total ? (100 * (activ[0]?.activos || 0) / activ[0]?.total) : 0)
      }
    };

    // ===== Series =====
    const r1 = range('fechaAplicacion', from, to);
    const r2 = range('ap.fechaAplicacion', from, to);
    const rB = range('fechaRegistro', from, to);
    const rP = range('p.validFrom', from, to);

    // 1) Usos por mes
    const usosPorMes = await runSafe(conn, `
      SELECT DATE_FORMAT(fechaAplicacion,'%Y-%m') AS mes, COUNT(*) AS usos
      FROM \`AplicacionPromocion\`
      WHERE 1=1 ${r1.where}
      GROUP BY mes
      ORDER BY mes ASC
    `, r1.params);

    // 2) Top establecimientos (por usos)
    const topEstablecimientos = await runSafe(conn, `
      SELECT e.idEstablecimiento, e.nombre, COUNT(*) AS usos
      FROM \`AplicacionPromocion\` ap
      JOIN \`Sucursal\` s ON s.idSucursal = ap.idSucursal
      JOIN \`Establecimiento\` e ON e.idEstablecimiento = s.idEstablecimiento
      WHERE 1=1 ${r2.where}
      GROUP BY e.idEstablecimiento, e.nombre
      ORDER BY usos DESC
      LIMIT 10
    `, r2.params);

    // 3) Cobertura por categoría (establecimientos)
    const topCategoriasEstab = await runSafe(conn, `
      SELECT c.nombre AS categoria, COUNT(*) AS establecimientos
      FROM \`CategoriaEstablecimiento\` ce
      JOIN \`Categoria\` c ON c.idCategoria = ce.idCategoria
      GROUP BY c.nombre
      ORDER BY establecimientos DESC
      LIMIT 10
    `);

    // 4) Pie: redenciones por categoría de cupón
    const redencionesPorCat = await runSafe(conn, `
      SELECT COALESCE(cc.nombre,'(sin categoría)') AS categoria, SUM(p.redeemedCount) AS redenciones
      FROM \`Promocion\` p
      LEFT JOIN \`CategoriaCupon\` cc ON cc.idCategoriaCupon = p.idCategoriaCupon
      WHERE 1=1 ${rP.where}
      GROUP BY categoria
      ORDER BY redenciones DESC
    `, rP.params);

    // 5) Heatmap 24×7: usos por hora × día
    const usosPorHora = await runSafe(conn, `
      SELECT DAYOFWEEK(fechaAplicacion) AS dow, HOUR(fechaAplicacion) AS hora, COUNT(*) AS usos
      FROM \`AplicacionPromocion\`
      WHERE 1=1 ${r1.where}
      GROUP BY dow, hora
      ORDER BY dow, hora
    `, r1.params);

    // 6) Crecimiento de beneficiarios
    const crecimientoBeneficiarios = await runSafe(conn, `
      SELECT DATE_FORMAT(fechaRegistro,'%Y-%m') AS mes, COUNT(*) AS nuevos
      FROM \`Beneficiario\`
      WHERE 1=1 ${rB.where}
      GROUP BY mes
      ORDER BY mes ASC
    `, rB.params);

    // 7) Activación por mes (registrados vs activados)
    const activacionPorMes = await runSafe(conn, `
      WITH bm AS (
        SELECT DATE_FORMAT(fechaRegistro,'%Y-%m') AS mes, idBeneficiario
        FROM \`Beneficiario\`
        WHERE 1=1 ${rB.where}
      )
      SELECT bm.mes,
             COUNT(*) AS registrados,
             COUNT(DISTINCT ap.idBeneficiario) AS activados
      FROM bm
      LEFT JOIN \`AplicacionPromocion\` ap ON ap.idBeneficiario = bm.idBeneficiario
      GROUP BY bm.mes
      ORDER BY bm.mes ASC
    `, rB.params);

    // 8) Usos por día de la semana
    const usosPorDiaSemana = await runSafe(conn, `
      SELECT DAYNAME(fechaAplicacion) AS dia, COUNT(*) AS usos
      FROM \`AplicacionPromocion\`
      WHERE 1=1 ${r1.where}
      GROUP BY dia
      ORDER BY FIELD(dia,'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')
    `, r1.params);

    // 9) Estado catálogo de promos (stacked sinLimite/conLimite)
    const promosStatus = await runSafe(conn, `
      SELECT status,
             SUM(unlimited=1) AS sinLimite,
             SUM(unlimited=0) AS conLimite,
             COUNT(*)         AS total
      FROM \`Promocion\`
      GROUP BY status
      ORDER BY total DESC
    `);

    // 10) Redenciones por mes (APPROVED)
    const redencionesPorMes = await runSafe(conn, `
      SELECT DATE_FORMAT(validFrom,'%Y-%m') AS mes, SUM(redeemedCount) AS redenciones
      FROM \`Promocion\`
      WHERE status='APPROVED' AND validFrom IS NOT NULL
      ${from ? ' AND validFrom >= ?' : ''} ${to ? ' AND validFrom < ?' : ''}
      GROUP BY mes
      ORDER BY mes ASC
    `, [ ...(from?[from]:[]), ...(to?[to]:[]) ]);

    // Tabla: Top Dueños
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
      WHERE 1=1 ${r2.where}
      GROUP BY d.idDueno, d.nombreUsuario, d.email
      ORDER BY usos DESC
      LIMIT 10
    `, r2.params);

    // Auditoría (últimos eventos)
    const auditoria = await runSafe(conn, `
      SELECT id, created_at, actorUser, actorRole, action, entityType, entityId
      FROM \`AuditEvents\`
      ORDER BY created_at DESC
      LIMIT 15
    `);

    const data = {
      kpis,
      series: {
        usosPorMes,
        topEstablecimientos,
        topCategoriasEstab,
        redencionesPorCat,
        usosPorHora,
        crecimientoBeneficiarios,
        activacionPorMes,
        usosPorDiaSemana,
        promosStatus,
        redencionesPorMes,
        topDuenos,
        slaModeracion: (moderQ[0] || {})
      },
      auditoria,
      filters: { from, to }
    };

    return json(200, { success: true, data });

  } catch (err) {
    console.error('Admin reports error:', err);
    const msg = err?.message || 'Error generando reportes';
    if (String(msg).includes('Token') || String(msg).includes('Acceso denegado')) {
      return json(401, { success:false, message: msg });
    }
    return json(500, { success:false, message: msg });
  } finally {
    try { if (conn?.release) conn.release(); else if (conn?.end) await conn.end(); } catch {}
  }
};
