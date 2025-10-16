require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');
const Joi = require('joi');

const updateEstablecimientoSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres'
  }),
  logoURL: Joi.string().uri().optional().allow(null, '').messages({
    'string.uri': 'La URL del logo debe ser válida'
  }),
  categorias: Joi.array().items(Joi.number().integer()).min(1).optional().messages({
    'array.min': 'Debe seleccionar al menos una categoría'
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
    const user = verifyRole(event, ['administrador', 'dueno']);
    
    // Obtener el idEstablecimiento de la URL
    const idEstablecimiento = event.pathParameters?.id;
    
    if (!idEstablecimiento) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'ID de establecimiento no proporcionado'
        })
      };
    }

    console.log(`Admin ${user.id} solicita actualizar establecimiento ${idEstablecimiento}`);

    // Validar el body
    const body = JSON.parse(event.body);
    const { error, value } = updateEstablecimientoSchema.validate(body);
    
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

    const connection = await getConnection();

    // Verificar que el establecimiento existe
    const [establecimientos] = await connection.execute(
      'SELECT idEstablecimiento FROM Establecimiento WHERE idEstablecimiento = ?',
      [idEstablecimiento]
    );

    if (establecimientos.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Establecimiento no encontrado'
        })
      };
    }

    // Actualizar campos del establecimiento si se proporcionaron
    const fieldsToUpdate = [];
    const values = [];

    if (value.nombre) {
      fieldsToUpdate.push('nombre = ?');
      values.push(value.nombre);
    }

    if (value.logoURL !== undefined) {
      fieldsToUpdate.push('logoURL = ?');
      values.push(value.logoURL || null);
    }

    if (fieldsToUpdate.length > 0) {
      values.push(idEstablecimiento);
      await connection.execute(
        `UPDATE Establecimiento SET ${fieldsToUpdate.join(', ')} WHERE idEstablecimiento = ?`,
        values
      );
    }

    // Actualizar categorías si se proporcionaron
    if (value.categorias) {
      // Verificar que las categorías existen
      const [categorias] = await connection.execute(
        `SELECT idCategoria FROM Categoria WHERE idCategoria IN (${value.categorias.map(() => '?').join(',')})`,
        value.categorias
      );

      if (categorias.length !== value.categorias.length) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Una o más categorías no existen'
          })
        };
      }

      // Eliminar categorías existentes
      await connection.execute(
        'DELETE FROM CategoriaEstablecimiento WHERE idEstablecimiento = ?',
        [idEstablecimiento]
      );

      // Insertar nuevas categorías
      for (const idCategoria of value.categorias) {
        await connection.execute(
          'INSERT INTO CategoriaEstablecimiento (idEstablecimiento, idCategoria) VALUES (?, ?)',
          [idEstablecimiento, idCategoria]
        );
      }
    }

    // Obtener el establecimiento actualizado
    const [updated] = await connection.execute(`
      SELECT 
        e.idEstablecimiento,
        e.nombre,
        e.logoURL,
        e.activo,
        e.fechaRegistro,
        GROUP_CONCAT(c.nombre SEPARATOR ', ') AS categorias
      FROM Establecimiento e
      LEFT JOIN CategoriaEstablecimiento ce ON e.idEstablecimiento = ce.idEstablecimiento
      LEFT JOIN Categoria c ON ce.idCategoria = c.idCategoria
      WHERE e.idEstablecimiento = ?
      GROUP BY e.idEstablecimiento
    `, [idEstablecimiento]);

    console.log(`Establecimiento ${idEstablecimiento} actualizado exitosamente`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Establecimiento actualizado exitosamente',
        data: {
          idEstablecimiento: updated[0].idEstablecimiento,
          nombre: updated[0].nombre,
          logoURL: updated[0].logoURL,
          categorias: updated[0].categorias,
          activo: updated[0].activo,
          fechaRegistro: updated[0].fechaRegistro
        }
      })
    };

  } catch (error) {
    console.error('Error actualizando establecimiento:', error);

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
        message: 'Error al actualizar establecimiento',
        error: error.message
      })
    };
  }
};