require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'PATCH,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Verificar que sea administrador
    const user = verifyRole(event, ['administrador']);

    // Obtener el idSucursal desde los parámetros de la ruta
    const idSucursal = event.pathParameters?.id;

    if (!idSucursal) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'ID de sucursal no proporcionado'
        })
      };
    }

    console.log(`Admin ${user.id} solicita cambiar estado de la sucursal ${idSucursal}`);

    const connection = await getConnection();

    // Verificar que la sucursal exista
    const [sucursales] = await connection.execute(
      'SELECT idSucursal, activo FROM Sucursal WHERE idSucursal = ?',
      [idSucursal]
    );

    if (sucursales.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Sucursal no encontrada'
        })
      };
    }

    const sucursal = sucursales[0];
    const nuevoEstado = !sucursal.activo; // invertir el estado actual

    // Actualizar el estado de la sucursal
    await connection.execute(
      'UPDATE Sucursal SET activo = ? WHERE idSucursal = ?',
      [nuevoEstado, idSucursal]
    );

    console.log(`Sucursal ${idSucursal} actualizada: ${sucursal.activo} → ${nuevoEstado}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Estado de la sucursal actualizado correctamente',
        data: {
          idSucursal: parseInt(idSucursal),
          activo: nuevoEstado
        }
      })
    };

  } catch (error) {
    console.error('Error actualizando estado de la sucursal:', error);

    if (error.message.includes('Token') || error.message.includes('Acceso denegado')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: error.message
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al actualizar estado de la sucursal',
        error: error.message
      })
    };
  }
};
