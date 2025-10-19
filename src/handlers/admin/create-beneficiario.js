require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
  },
  body: JSON.stringify(body),
});

async function q(conn, sql, params = []) { const [rows] = await conn.query(sql, params); return rows; }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  let conn;
  try {
    verifyRole(event, ['administrador']);
    conn = await getConnection();

    const body = JSON.parse(event.body || '{}');
    const required = ['primerNombre','apellidoPaterno','apellidoMaterno','curp','email','celular','fechaNacimiento'];
    const missing = required.filter(k => !body[k]);
    if (missing.length) return json(400, { success:false, message:`Faltan campos: ${missing.join(', ')}` });

    // Genera folio si no viene
    const folio = body.folio && String(body.folio).trim()
      ? String(body.folio).trim()
      : `BJ${Math.random().toString().slice(2,10)}`;

    // Hash password si viene; si no, una dummy (puedes ajustarlo a tu flujo)
    const pwd = body.password || Math.random().toString(36).slice(2,10);
    const hash = await bcrypt.hash(pwd, 10);

    // Insert
    const res = await q(conn, `
      INSERT INTO \`Beneficiario\`
        (primerNombre,segundoNombre,apellidoPaterno,apellidoMaterno,curp,email,folio,celular,fechaNacimiento,sexo,passwordHash,activo)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
    `, [
      body.primerNombre || null,
      body.segundoNombre || null,
      body.apellidoPaterno || null,
      body.apellidoMaterno || null,
      body.curp || null,
      body.email || null,
      folio,
      body.celular || null,
      body.fechaNacimiento || null,
      body.sexo || null,
      hash
    ]);

    const nuevoId = res.insertId;

    // Auditoría mínima
    try {
      await q(conn, `
        INSERT INTO AuditEvents(actorUser,actorRole,action,entityType,entityId,payloadNew,created_at)
        VALUES (NULL,'ADMIN','CREATE','USUARIO',?,JSON_OBJECT('email',?, 'curp', ?),NOW())
      `, [nuevoId, body.email, body.curp]);
    } catch {}

    return json(201, {
      success:true,
      data:{ idBeneficiario:nuevoId, folio },
      tempPassword: body.password ? undefined : pwd // útil si no envías email todavía
    });

  } catch (err) {
    console.error('create-beneficiario error:', err);
    const msg = err?.message || 'No se pudo crear el beneficiario';
    const code = String(msg).includes('Token') ? 401 : 500;
    return json(code, { success:false, message: msg });
  }
};
