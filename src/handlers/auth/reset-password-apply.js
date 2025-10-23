require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyParams } = require('../../config/reset_link');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success:false, message:'Method Not Allowed' }) };

  let conn;
  try {
    const { email, type, exp, sig, newPassword, confirmPassword } = JSON.parse(event.body || '{}');
    if (!newPassword || newPassword !== confirmPassword || newPassword.length < 6) {
      return { statusCode: 400, headers, body: JSON.stringify({ success:false, message:'La contraseña debe tener al menos 6 caracteres y coincidir.' }) };
    }

    const emailLc = (email || '').toLowerCase();
    if (!verifyParams({ email: emailLc, type, exp, sig })) {
      return { statusCode: 400, headers, body: JSON.stringify({ success:false, message:'Enlace inválido o expirado.' }) };
    }

    conn = await getConnection();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    let updated = 0;
    if (type === 'beneficiario') {
      const [r] = await conn.query('UPDATE Beneficiario SET passwordHash = ? WHERE email_lc = ? LIMIT 1', [hash, emailLc]);
      updated = r.affectedRows || 0;
    } else if (type === 'dueno') {
      const [r] = await conn.query('UPDATE Dueno SET passwordHash = ? WHERE email_lc = ? LIMIT 1', [hash, emailLc]);
      updated = r.affectedRows || 0;
    }

    if (!updated) {
      return { statusCode: 404, headers, body: JSON.stringify({ success:false, message:'No se encontró el usuario.' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success:true, message:'Contraseña actualizada. Ya puedes iniciar sesión.' }) };
  } catch (e) {
    console.error('reset-password-apply error', e);
    return { statusCode: 500, headers, body: JSON.stringify({ success:false, message:'Error del servidor' }) };
  } finally {
    if (conn) try { await conn.end(); } catch {}
  }
};
