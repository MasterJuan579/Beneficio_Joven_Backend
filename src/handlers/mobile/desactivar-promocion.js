// src/handlers/mobile/desactivar-promocion.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

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
      user = verifyRole(event, ['dueno']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    // idEstablecimiento: esto sale de una query a partir del idDueno
    // idPromocion: tiene que venir de la URL
    const idDueno = user.id;
    const idPromocion = event.pathParameters?.idPromocion;
    if (!idPromocion) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
            success: false, 
            message: 'El campo idPromocion es obligatorio' 
            }),
        };
    }

    const conn = await getConnection();

    // Checar si el dueño mandó un id que corresponde a su establecimiento
    const [establecimientoRows] = await conn.execute(`
        SELECT idEstablecimiento FROM DuenoEstablecimiento WHERE idDueno = ?
    `, [idDueno]);

    if (establecimientoRows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'Dueño no asociado a ningún establecimiento' }),
      };
    }

    const idEstablecimiento = establecimientoRows[0].idEstablecimiento;

    // Desactivar el campo esVigente y poner el status en "PAUSED"
    const [result] = await conn.execute(`
        UPDATE Promocion 
        SET esVigente = 0, status = 'PAUSED'
        WHERE idPromocion = ? AND idEstablecimiento = ?
    `, [idPromocion, idEstablecimiento]);

    // Regresa el status de éxito
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Promoción desactivada correctamente'
      })
    };
    
  } catch (err) {
    console.error('[desactivar-promocion] error:', err);
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
