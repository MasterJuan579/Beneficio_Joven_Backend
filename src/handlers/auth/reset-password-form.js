require('dotenv').config();
const { verifyParams } = require('../../config/reset_link');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: headers, body: 'Method Not Allowed' };

  const q = event.queryStringParameters || {};
  const email = (q.email || '').toLowerCase();
  const type  = (q.type  || '').toLowerCase();
  const exp   = q.exp;
  const sig   = q.sig;

  const valid = verifyParams({ email, type, exp, sig });

  if (!valid) {
    return {
      statusCode: 400,
      headers,
      body: `<html><body style="font-family:system-ui">
        <h1>Enlace inválido o expirado</h1>
        <p>Solicita nuevamente el restablecimiento de contraseña.</p>
      </body></html>`
    };
  }

  // HTML mínimo con fetch POST al endpoint de cambio
  const page = `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Restablecer contraseña</title>
</head>
<body style="font-family:system-ui;max-width:520px;margin:40px auto;padding:0 16px">
  <h1>Restablecer contraseña</h1>
  <p>Para <b>${email}</b></p>
  <form id="f">
    <input type="hidden" name="email" value="${email}">
    <input type="hidden" name="type" value="${type}">
    <input type="hidden" name="exp" value="${exp}">
    <input type="hidden" name="sig" value="${sig}">
    <label>Nueva contraseña</label><br>
    <input name="password" type="password" minlength="6" required style="width:100%;padding:10px;margin:8px 0"><br>
    <label>Confirmar contraseña</label><br>
    <input name="confirm" type="password" minlength="6" required style="width:100%;padding:10px;margin:8px 0"><br>
    <button type="submit" style="padding:10px 16px">Guardar</button>
  </form>
  <p id="msg"></p>
<script>
  const form = document.getElementById('f');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      email: fd.get('email'),
      type: fd.get('type'),
      exp: fd.get('exp'),
      sig: fd.get('sig'),
      newPassword: fd.get('password'),
      confirmPassword: fd.get('confirm')
    };
    const res = await fetch('/auth/reset-password-apply', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=>({success:false,message:'Error'}));
    const msg = document.getElementById('msg');
    msg.textContent = data.message || (data.success ? 'Listo' : 'Error');
    if (data.success) msg.style.color = 'green'; else msg.style.color = 'red';
  });
</script>
</body></html>`;

  return { statusCode: 200, headers, body: page };
};
