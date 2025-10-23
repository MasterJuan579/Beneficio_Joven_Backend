// src/handlers/mobile/historial-canje.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

// Necesita regresar el nombre del beneficiario, su folio, el nombre de la oferta y la fecha/hora de canje

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    try {
      user = verifyRole(event, ['dueno']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    const idDueno = user.id;
    const conn = await getConnection();

    // Primero obtiene el establecimiento asociado al dueño autenticado
    const [establecimientos] = await conn.execute(`
      SELECT idEstablecimiento FROM DuenoEstablecimiento
      WHERE idDueno = ?
    `, [idDueno]);

    if (establecimientos.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'El dueño no tiene un establecimiento asociado'
        })
      };
    }

    const idEstablecimiento = establecimientos[0].idEstablecimiento;

    // Obtiene el historial de los últimos 15 canjes para el establecimiento del dueño
    const [rows] = await conn.execute(`
      SELECT 
        b.primerNombre AS nombreBeneficiario,
        b.folio AS folioBeneficiario,
        p.titulo AS tituloPromocion,
        c.fechaAplicacion AS fechaAplicacion
      FROM AplicacionPromocion c
      JOIN Beneficiario b ON c.idBeneficiario = b.idBeneficiario
      JOIN Promocion p ON c.idPromocion = p.idPromocion
      WHERE p.idEstablecimiento = ?
      ORDER BY c.fechaAplicacion DESC
      LIMIT 15
    `, [idEstablecimiento]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: rows
      }),
    };

} catch (err) {
    console.error('[historial-canje] error:', err);
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
