require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');
const Joi = require('joi');

// ✅ Esquema de validación (máximo 5 imágenes)
const createSucursalSchema = Joi.object({
  idEstablecimiento: Joi.number().integer().required(),
  nombre: Joi.string().min(3).max(100).required(),
  direccion: Joi.string().required(),
  latitud: Joi.number().required(),
  longitud: Joi.number().required(),
  horaApertura: Joi.string().required(),
  horaCierre: Joi.string().required(),
  imagenes: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().required()
    })
  ).max(5).optional()
});

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método no permitido' }) };
  }

  try {
    const user = verifyRole(event, ['administrador', 'dueno']);
    console.log(`🟢 Usuario ${user.id} creando nueva sucursal`);

    const body = JSON.parse(event.body);
    const { error, value } = createSucursalSchema.validate(body);

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

    const [result] = await connection.execute(
      `INSERT INTO Sucursal 
      (idEstablecimiento, nombre, direccion, latitud, longitud, horaApertura, horaCierre, activo, fechaRegistro)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        value.idEstablecimiento,
        value.nombre,
        value.direccion,
        value.latitud,
        value.longitud,
        value.horaApertura,
        value.horaCierre
      ]
    );

    const idSucursal = result.insertId;

    if (value.imagenes && value.imagenes.length > 0) {
      for (const img of value.imagenes.slice(0, 5)) {
        await connection.execute(
          `INSERT INTO SucursalImagen (idSucursal, urlImagen, publicId)
           VALUES (?, ?, ?)`,
          [idSucursal, img.url, img.publicId]
        );
      }
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sucursal creada exitosamente',
        data: { idSucursal }
      })
    };

  } catch (error) {
    console.error('❌ Error creando sucursal:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al crear sucursal',
        error: error.message
      })
    };
  }
};
