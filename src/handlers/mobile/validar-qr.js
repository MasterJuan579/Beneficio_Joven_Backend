// src/handlers/mobile/validar-qr.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

/**
 * Valida el código QR recibido desde la aplicación móvil. Hace tres cosas:
 * 1. Verifica que el código QR no haya expirado.
 * 2. Hace la inserción del canje en la base de datos.
 * 3. Regresa una respuesta indicando si se aplicó o no el descuento.
 *
 * Si alguna validación falla, retorna un mensaje de error específico.
 * 
 * Queda pendiente ver si la decodificación del QR se hace aquí o en la app móvil.
 */ 

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    try {
      verifyRole(event, ['dueno']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    // Obtiene cada variable del body por separado y lo convierte al tipo correspondiente
    const body = JSON.parse(event.body);
    const idBeneficiario = Number(body.userId);
    const idPromocion = Number(body.idPromocion);
    const expirationTime = Number(body.expirationTime);

    const current_timestamp = Math.floor(Date.now() / 1000);

    const conn = await getConnection();

    // Verifica que el código QR no haya expirado
    if (current_timestamp > expirationTime) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'El código QR ha expirado'
        })
      };
    }

    // Inserta el canje en la base de datos
    await conn.execute(`
      INSERT INTO AplicacionPromocion (idBeneficiario, idPromocion)
      VALUES (?, ?)
    `, [idBeneficiario, idPromocion]);

    // Regresa SOLAMENTE el status de éxito
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Descuento aplicado correctamente'
      })
    };
    
  } catch (err) {
    console.error('[validar-qr] error:', err);
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
