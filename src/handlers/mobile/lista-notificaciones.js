// src/handlers/mobile/lista-notificaciones.js
require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

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
      verifyRole(event, ['beneficiario']);
    } catch (e) {
      return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: e.message || 'Unauthorized' }) };
    }

    const conn = await getConnection();

    // Obtener las últimas 10 promociones dadas de alta
    // Obtener titulo, descripcion, validTo
    // Solo incluir las promociones activas (status = 'APPROVED') y que no hayan expirado (validTo > NOW())

    const [rows] = await conn.execute(`
      SELECT
        p.titulo,
        p.descripcion,
        p.validTo,
        e.nombre AS establecimiento
      FROM Promocion p
      JOIN Establecimiento e ON e.idEstablecimiento = p.idEstablecimiento
      WHERE p.status = 'APPROVED' 
      AND p.validTo > NOW()
      ORDER BY p.idPromocion DESC
      LIMIT 10
    `);

    // Formatear validTo de 2025-11-02 00:00:00 a 02/11/2025
    // Concatenar el nombre del establecimiento al título de la promoción (ejemplo: "Promoción en [Establecimiento]: [Título]")
    const formattedRows = rows.map(r => ({
      titulo: `Promoción en ${r.establecimiento}: ${r.titulo}`,
      descripcion: r.descripcion,
      validTo: r.validTo ? new Date(r.validTo).toLocaleDateString('es-ES') : null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        notifications: formattedRows
      }),
    };

} catch (err) {
    console.error('[lista-notificaciones] error:', err);
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
