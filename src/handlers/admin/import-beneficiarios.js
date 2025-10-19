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
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const commit = body.commit === true;

    if (!rows.length) return json(400, { success:false, message:'rows vacío' });

    // Validación ligera
    const errors = [];
    const cleaned = rows.map((r, i) => {
      const req = ['primerNombre','apellidoPaterno','apellidoMaterno','curp','email','celular','fechaNacimiento'];
      const miss = req.filter(k => !r[k]);
      if (miss.length) errors.push({ index:i, error:`Faltan: ${miss.join(', ')}` });

      return {
        primerNombre: r.primerNombre || null,
        segundoNombre: r.segundoNombre || null,
        apellidoPaterno: r.apellidoPaterno || null,
        apellidoMaterno: r.apellidoMaterno || null,
        curp: r.curp || null,
        email: r.email || null,
        celular: r.celular || null,
        fechaNacimiento: r.fechaNacimiento || null,
        sexo: r.sexo || null,
        folio: r.folio && String(r.folio).trim() ? String(r.folio).trim() : `BJ${Math.random().toString().slice(2,10)}`
      };
    });

    if (errors.length && commit) {
      return json(400, { success:false, message:'Errores de validación', errors });
    }

    if (!commit) {
      return json(200, { success:true, preview:{ total: cleaned.length, invalid: errors.length, errors } });
    }

    // Commit
    let inserted = 0, skipped = 0, duplicates = [];
    for (const r of cleaned) {
      try {
        // checar duplicados por email/curp/folio
        const dup = await q(conn, `
          SELECT idBeneficiario FROM Beneficiario WHERE email=? OR curp=? OR folio=?
        `, [r.email, r.curp, r.folio]);
        if (dup.length) {
          duplicates.push({ email:r.email, curp:r.curp, folio:r.folio });
          skipped++;
          continue;
        }

        const tmpPwd = Math.random().toString(36).slice(2,10);
        const hash = await bcrypt.hash(tmpPwd, 10);

        await q(conn, `
          INSERT INTO Beneficiario
            (primerNombre,segundoNombre,apellidoPaterno,apellidoMaterno,curp,email,folio,celular,fechaNacimiento,sexo,passwordHash,activo)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
        `, [
          r.primerNombre, r.segundoNombre, r.apellidoPaterno, r.apellidoMaterno,
          r.curp, r.email, r.folio, r.celular, r.fechaNacimiento, r.sexo, hash
        ]);
        inserted++;
      } catch (e) {
        errors.push({ error: e.message, email: r.email, curp: r.curp });
      }
    }

    return json(200, { success:true, result:{ inserted, skipped, duplicates, errors } });

  } catch (err) {
    console.error('import-beneficiarios error:', err);
    const msg = err?.message || 'No se pudo importar';
    const code = String(msg).includes('Token') ? 401 : 500;
    return json(code, { success:false, message: msg });
  }
};
