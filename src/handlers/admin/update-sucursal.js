require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');
const cloudinary = require('cloudinary').v2;
const Joi = require('joi');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Esquema de validación
const updateSucursalSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).optional(),
  direccion: Joi.string().max(255).optional(),
  latitud: Joi.number().min(-90).max(90).optional(),
  longitud: Joi.number().min(-180).max(180).optional(),
  horaApertura: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().messages({
    'string.pattern.base': 'Formato de hora inválido (debe ser HH:mm)'
  }),
  horaCierre: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().messages({
    'string.pattern.base': 'Formato de hora inválido (debe ser HH:mm)'
  }),
  imagenes: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().required()
    })
  ).max(5).optional().messages({
    'array.max': 'Máximo 5 imágenes permitidas'
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
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let connection;

  try {
    // Verificar autenticación
    const user = verifyRole(event, ['administrador', 'dueno']);

    // Obtener ID de la URL
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

    // Validar body
    const body = JSON.parse(event.body);
    const { error, value } = updateSucursalSchema.validate(body);

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

    // Validar horarios si ambos están presentes
    if (value.horaApertura && value.horaCierre) {
      if (value.horaApertura >= value.horaCierre) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'La hora de apertura debe ser antes que la hora de cierre'
          })
        };
      }
    }

    console.log(`👤 Usuario ${user.id} (${user.role}) actualizando sucursal ${idSucursal}`);

    connection = await getConnection();

    // Verificar que la sucursal existe
    const [sucursales] = await connection.execute(
      'SELECT idSucursal, idEstablecimiento FROM Sucursal WHERE idSucursal = ?',
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

    // Si es dueño, verificar que la sucursal le pertenece
    if (user.role === 'dueno') {
      const [ownership] = await connection.execute(`
        SELECT de.idDueno
        FROM DuenoEstablecimiento de
        WHERE de.idEstablecimiento = ? AND de.idDueno = ?
      `, [sucursales[0].idEstablecimiento, user.id]);

      if (ownership.length === 0) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'No tienes permiso para editar esta sucursal'
          })
        };
      }
    }

    // Actualizar campos de la sucursal
    const fieldsToUpdate = [];
    const values = [];

    if (value.nombre) {
      fieldsToUpdate.push('nombre = ?');
      values.push(value.nombre);
    }

    if (value.direccion) {
      fieldsToUpdate.push('direccion = ?');
      values.push(value.direccion);
    }

    if (value.latitud !== undefined) {
      fieldsToUpdate.push('latitud = ?');
      values.push(value.latitud);
    }

    if (value.longitud !== undefined) {
      fieldsToUpdate.push('longitud = ?');
      values.push(value.longitud);
    }

    if (value.horaApertura) {
      fieldsToUpdate.push('horaApertura = ?');
      values.push(value.horaApertura);
    }

    if (value.horaCierre) {
      fieldsToUpdate.push('horaCierre = ?');
      values.push(value.horaCierre);
    }

    // Ejecutar actualización si hay campos
    if (fieldsToUpdate.length > 0) {
      values.push(idSucursal);
      await connection.execute(
        `UPDATE Sucursal SET ${fieldsToUpdate.join(', ')} WHERE idSucursal = ?`,
        values
      );
      console.log(`✅ Campos básicos actualizados`);
    }

    // Gestionar imágenes si se proporcionaron
    if (value.imagenes !== undefined) {
      console.log(`🖼️ Actualizando imágenes...`);

      // Obtener imágenes actuales
      const [currentImages] = await connection.execute(
        'SELECT idImagen, publicId FROM SucursalImagen WHERE idSucursal = ?',
        [idSucursal]
      );

      // Determinar qué imágenes eliminar
      const newPublicIds = value.imagenes.map(img => img.publicId);
      const toDelete = currentImages.filter(img => !newPublicIds.includes(img.publicId));

      // Eliminar imágenes de Cloudinary y BD
      for (const img of toDelete) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
          console.log(`🗑️ Imagen eliminada de Cloudinary: ${img.publicId}`);
        } catch (err) {
          console.warn(`⚠️ No se pudo eliminar ${img.publicId} de Cloudinary:`, err.message);
        }

        await connection.execute(
          'DELETE FROM SucursalImagen WHERE idImagen = ?',
          [img.idImagen]
        );
      }

      // Obtener publicIds existentes en BD
      const [remaining] = await connection.execute(
        'SELECT publicId FROM SucursalImagen WHERE idSucursal = ?',
        [idSucursal]
      );
      const existingPublicIds = remaining.map(r => r.publicId);

      // Insertar solo las nuevas imágenes
      for (const img of value.imagenes) {
        if (!existingPublicIds.includes(img.publicId)) {
          await connection.execute(
            'INSERT INTO SucursalImagen (idSucursal, urlImagen, publicId, fechaRegistro) VALUES (?, ?, ?, NOW())',
            [idSucursal, img.url, img.publicId]
          );
          console.log(`➕ Nueva imagen agregada: ${img.publicId}`);
        }
      }

      console.log(`✅ Imágenes actualizadas correctamente`);
    }

    // Obtener sucursal actualizada
    const [updated] = await connection.execute(`
      SELECT 
        s.idSucursal,
        s.idEstablecimiento,
        s.numSucursal,
        s.nombre AS nombreSucursal,
        s.direccion,
        s.latitud,
        s.longitud,
        s.horaApertura,
        s.horaCierre,
        s.activo,
        s.fechaRegistro,
        e.nombre AS nombreEstablecimiento,
        GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categoria
      FROM Sucursal s
      INNER JOIN Establecimiento e ON s.idEstablecimiento = e.idEstablecimiento
      LEFT JOIN CategoriaEstablecimiento ce ON e.idEstablecimiento = ce.idEstablecimiento
      LEFT JOIN Categoria c ON ce.idCategoria = c.idCategoria
      WHERE s.idSucursal = ?
      GROUP BY s.idSucursal
    `, [idSucursal]);

    // Obtener imágenes actualizadas
    const [updatedImages] = await connection.execute(`
      SELECT 
        idImagen,
        urlImagen AS url,
        publicId,
        fechaRegistro
      FROM SucursalImagen
      WHERE idSucursal = ?
      ORDER BY fechaRegistro ASC
    `, [idSucursal]);

    const result = {
      ...updated[0],
      imagenes: updatedImages
    };

    console.log(`✅ Sucursal ${idSucursal} actualizada exitosamente`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sucursal actualizada exitosamente',
        data: result
      })
    };

  } catch (error) {
    console.error('❌ Error actualizando sucursal:', error);

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
        message: 'Error al actualizar sucursal',
        error: error.message
      })
    };
  }
};