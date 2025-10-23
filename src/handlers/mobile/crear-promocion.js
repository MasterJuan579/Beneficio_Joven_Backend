// src/handlers/mobile/crear-promocion.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

/**
 * Registra una nueva promoción en la base de datos para un establecimiento específico.
 * 1. Verifica que el usuario tenga el rol adecuado antes de permitir la creación.
 * 2. Recibe los detalles de la promoción en el body de la solicitud.
 * 3. Inserta la nueva promoción en la base de datos.
 * 4. Retorna una respuesta indicando el éxito o fracaso de la operación.
 * 
 * Si alguna validación falla, retorna un mensaje de error específico.
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
      user = verifyRole(event, ['dueno']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    // idEstablecimiento: esto sale de una query a partir del idDueno
    // titulo, descripcion, discountType, discountValue, validFrom, validTo: tienen que venir del body
    // unlimited: asignar a 1 siempre
    const idDueno = user.id;
    const body = JSON.parse(event.body);
    const titulo = body.titulo;
    const descripcion = body.descripcion;
    const discountType = body.discountType;
    const discountValue = body.discountValue;
    const validFrom = body.validFrom || null;
    const validTo = body.validTo || null;

    if (!titulo || !discountType || !discountValue) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
            success: false, 
            message: 'Los campos título, tipo de descuento y valor son obligatorios' 
            }),
        };
    }

    const conn = await getConnection();

    // Obtener el idEstablecimiento asociado al dueño
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

    // Insertar la nueva promoción en la base de datos
    await conn.execute(`
        INSERT INTO Promocion (idEstablecimiento, titulo, descripcion, discountType, discountValue, validFrom, validTo, unlimited) VALUES
        (?, ?, ?, ?, ?, ?, ?, 1)
    `, [idEstablecimiento, titulo, descripcion, discountType, discountValue, validFrom, validTo]);

    // Regresa el status de éxito
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Promoción creada correctamente'
      })
    };
    
  } catch (err) {
    console.error('[crear-promocion] error:', err);
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
