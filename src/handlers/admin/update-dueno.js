require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');
const Joi = require('joi');

const updateDuenoSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Email inválido'
  }),
  nombreUsuario: Joi.string().min(3).max(50).optional().messages({
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
    'string.max': 'El nombre de usuario no puede exceder 50 caracteres'
  })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'PUT,OPTIONS',
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

    // Validar el body
    const body = JSON.parse(event.body);
    const { error, value } = updateDuenoSchema.validate(body);
    
    if (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(d => d.message)
        })
      };
    }

    console.log(`Admin ${user.id} solicita actualizar dueño ${idDueno}`);

    const connection = await getConnection();

    // Verificar que el dueño existe
    const [duenos] = await connection.execute(
      'SELECT idDueno, email, nombreUsuario FROM Dueno WHERE idDueno = ?',
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

    // Verificar si el nuevo email ya existe (si se está actualizando)
    if (value.email && value.email !== duenos[0].email) {
      const [existingEmail] = await connection.execute(
        'SELECT idDueno FROM Dueno WHERE email = ? AND idDueno != ?',
        [value.email.toLowerCase(), idDueno]
      );

      if (existingEmail.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'El email ya está registrado'
          })
        };
      }
    }

    // Verificar si el nuevo nombreUsuario ya existe (si se está actualizando)
    if (value.nombreUsuario && value.nombreUsuario !== duenos[0].nombreUsuario) {
      const [existingUsername] = await connection.execute(
        'SELECT idDueno FROM Dueno WHERE nombreUsuario = ? AND idDueno != ?',
        [value.nombreUsuario, idDueno]
      );

      if (existingUsername.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'El nombre de usuario ya está registrado'
          })
        };
      }
    }

    // Construir query de actualización dinámica
    const fieldsToUpdate = [];
    const values = [];

    if (value.email) {
      fieldsToUpdate.push('email = ?');
      values.push(value.email.toLowerCase());
    }

    if (value.nombreUsuario) {
      fieldsToUpdate.push('nombreUsuario = ?');
      values.push(value.nombreUsuario);
    }

    // Agregar el ID al final de los valores
    values.push(idDueno);

    // Ejecutar actualización
    await connection.execute(
      `UPDATE Dueno SET ${fieldsToUpdate.join(', ')} WHERE idDueno = ?`,
      values
    );

    // Obtener datos actualizados
    const [updated] = await connection.execute(
      'SELECT idDueno, email, nombreUsuario, fechaRegistro, activo FROM Dueno WHERE idDueno = ?',
      [idDueno]
    );

    console.log(`Dueño ${idDueno} actualizado exitosamente`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Dueño actualizado exitosamente',
        data: {
          idDueno: updated[0].idDueno,
          email: updated[0].email,
          nombreUsuario: updated[0].nombreUsuario,
          fechaRegistro: updated[0].fechaRegistro,
          activo: updated[0].activo
        }
      })
    };

  } catch (error) {
    console.error('Error actualizando dueño:', error);

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
        message: 'Error al actualizar dueño',
        error: error.message
      })
    };
  }
};