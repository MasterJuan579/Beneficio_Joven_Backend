require('dotenv').config();
const { getConnection } = require('../../config/database');
const { resend } = require('../../config/resend');
const { signParams } = require('../../config/reset_link');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success:false, message:'Method Not Allowed' }) };

  const genericMsg = 'Si el correo existe, te enviaremos un enlace para restablecer tu contraseña. Revisa tu bandeja y spam.';
  let conn;
  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email) return { statusCode: 200, headers, body: JSON.stringify({ success:true, message: genericMsg }) };
    const emailLc = String(email).trim().toLowerCase();

    conn = await getConnection();

    // Buscar Beneficiario o Dueño (no filtramos por activo para simplicidad)
    const [b] = await conn.query(
      'SELECT idBeneficiario AS id, primerNombre AS nombre, email FROM Beneficiario WHERE email_lc = ? LIMIT 1',
      [emailLc]
    );

    let user = null, type = null;
    if (b.length) {
      user = { id: b[0].id, nombre: b[0].nombre || '', email: b[0].email };
      type = 'beneficiario';
    } else {
      const [d] = await conn.query(
        'SELECT idDueno AS id, nombreUsuario AS nombre, email FROM Dueno WHERE email_lc = ? LIMIT 1',
        [emailLc]
      );
      if (d.length) {
        user = { id: d[0].id, nombre: d[0].nombre || '', email: d[0].email };
        type = 'dueno';
      }
    }

    // Siempre respondemos genérico
    if (!user) {
      return { statusCode: 200, headers, body: JSON.stringify({ success:true, message: genericMsg }) };
    }

    const ttl = Number(process.env.RESET_LINK_TTL_MINUTES || 30);
    const exp = Date.now() + ttl * 60 * 1000;
    const sig = signParams({ email: emailLc, type, exp });

    const base = (process.env.APP_BASE_URL || '').replace(/\/$/, '');
    const link = `${base}/auth/reset-password-form?email=${encodeURIComponent(emailLc)}&type=${type}&exp=${exp}&sig=${sig}`;

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: user.email,
        subject: 'Restablece tu contraseña',
        html: `
          <div style="font-family:system-ui,Segoe UI,Roboto,Arial">
            <h2>Hola ${user.nombre || ''}</h2>
            <p>Para restablecer tu contraseña, haz clic en el siguiente enlace (vigente ${ttl} minutos):</p>
            <p><a href="${link}">${link}</a></p>
            <p>Si no fuiste tú, ignora este correo.</p>
          </div>
        `,
        text: `Hola ${user.nombre || ''}\n\nEnlace para restablecer (vigente ${ttl} min):\n${link}\n\nSi no fuiste tú, ignora este correo.`
      });
    } else {
      console.log('[forgot-password-email] Resend no configurado. Link:', link);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success:true, message: genericMsg }) };
  } catch (e) {
    console.error('forgot-password-email error', e);
    return { statusCode: 200, headers, body: JSON.stringify({ success:true, message: genericMsg }) };
  } finally {
    if (conn) try { await conn.end(); } catch {}
  }
};
