/**
 * Generador de código QR para descuentos, el cual pueden redimir los beneficiarios en las sucursales afiliadas.
 * La respuesta tiene que tener: id del usuario que canjea el descuento, id del descuento a aplicar
 * y el timestamp de cuando se genera el código QR.
 */ 

require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');
const QRCode = require('qrcode');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'PUT,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    try {
        // Solo beneficiarios pueden generar códigos QR para descuentos
        user = verifyRole(event, ['beneficiario']);
    } catch (e) {
        return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    // Obtener datos para el código QR
    const userId = user.id;
    const timestamp = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
    const expirationTime = timestamp + (5 * 60); // 5 minutos en segundos
    const conn = await getConnection();

    const idPromocion = event.pathParameters?.idPromocion; // Obtener ID de la promoción desde la URL

    // Verificar que el ID de la promoción fue proporcionado
    if (!idPromocion) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'ID de promoción no proporcionado'
            })
        };
    }

    // Verificar la existencia y estado de la promoción en la base de datos
    const [promocion] = await conn.execute(`
      SELECT p.idPromocion
      FROM Promocion p
      WHERE p.idPromocion = ? AND p.esVigente = 1
    `, [idPromocion]);

    if (promocion.length === 0) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Promoción no encontrada o no vigente'
            })
        };
    }
    // Datos a codificar en el código QR
    const qrData = {
      userId,
      idPromocion,
      timestamp,
      expirationTime
    };

    // Generar el código QR como una cadena en formato Data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

    const data = {
      qrCode: qrCodeDataURL,
      expiresAt: expirationTime
    };

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };

  } catch (err) {
    console.error('generar-qr (mobile) error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message || 'Server error' }) };
  }
};