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
    
    // Obtener el idDueno de la URL
    const idDueno = event.pathParameters?.id;
    
    if (!idDueno) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'ID de dueño no proporcionado'
        })
      };
    }

    console.log(`Admin ${user.id} solicita cambiar estado del dueño ${idDueno}`);

    const connection = await getConnection();

    // Verificar que el dueño existe
    const [duenos] = await connection.execute(
      'SELECT idDueno, nombreUsuario, email, activo FROM Dueno WHERE idDueno = ?',
      [idDueno]
    );

    if (duenos.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Dueño no encontrado'
        })
      };
    }

    const dueno = duenos[0];
    const nuevoEstado = !dueno.activo; // Invertir el estado actual

    // Actualizar el estado
    await connection.execute(
      'UPDATE Dueno SET activo = ? WHERE idDueno = ?',
      [nuevoEstado, idDueno]
    );

    console.log(`Dueño ${idDueno} actualizado: ${dueno.activo} → ${nuevoEstado}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Estado actualizado correctamente',
        data: {
          idDueno: parseInt(idDueno),
          activo: nuevoEstado
        }
      })
    };

  } catch (error) {
    console.error('Error actualizando estado del dueño:', error);

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
        message: 'Error al actualizar estado',
        error: error.message
      })
    };
  }
};