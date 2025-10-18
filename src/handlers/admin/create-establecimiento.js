require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');
const Joi = require('joi');

//  Esquema de validación con dueño incluido
const createEstablecimientoSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  logoURL: Joi.string().uri().optional().allow(null, '').messages({
    'string.uri': 'La URL del logo debe ser válida'
  }),
  idCategoria: Joi.number().integer().required().messages({
    'number.base': 'La categoría debe ser un número válido',
    'any.required': 'La categoría es requerida'
  }),
  idDueno: Joi.number().integer().required().messages({
    'number.base': 'El dueño debe ser un número válido',
    'any.required': 'El dueño es requerido'
  })
});

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  //  Manejo de preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    //  Solo administradores pueden crear establecimientos
    const user = verifyRole(event, ['administrador']);
    console.log(` Admin ${user.id} solicita crear establecimiento`);

    // Parsear y validar body
    const body = JSON.parse(event.body);
    const { error, value } = createEstablecimientoSchema.validate(body);

    if (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map((d) => d.message)
        })
      };
    }

    const connection = await getConnection();

    // Verificar si ya existe un establecimiento con ese nombre
    const [existe] = await connection.execute(
      'SELECT idEstablecimiento FROM Establecimiento WHERE nombre = ? LIMIT 1',
      [value.nombre.trim()]
    );

    if (existe.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: `Ya existe un establecimiento con el nombre "${value.nombre}".`
        })
      };
    }

    //Verificar que la categoría exista
    const [categoria] = await connection.execute(
      'SELECT idCategoria FROM Categoria WHERE idCategoria = ?',
      [value.idCategoria]
    );

    if (categoria.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'La categoría especificada no existe'
        })
      };
    }

    // Verificar que el dueño exista y esté activo
    const [dueno] = await connection.execute(
      'SELECT idDueno, nombreUsuario, activo FROM Dueno WHERE idDueno = ?',
      [value.idDueno]
    );

    if (dueno.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'El dueño especificado no existe'
        })
      };
    }

    if (!dueno[0].activo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'El dueño especificado está inactivo'
        })
      };
    }

    // Insertar el nuevo establecimiento (activo por defecto)
    const [result] = await connection.execute(
      'INSERT INTO Establecimiento (nombre, logoURL, activo, fechaRegistro) VALUES (?, ?, 1, NOW())',
      [value.nombre.trim(), value.logoURL || null]
    );

    const idEstablecimiento = result.insertId;
    console.log(`🏗️ Establecimiento creado con ID: ${idEstablecimiento}`);

    //  Relacionar categoría
    await connection.execute(
      'INSERT INTO CategoriaEstablecimiento (idEstablecimiento, idCategoria) VALUES (?, ?)',
      [idEstablecimiento, value.idCategoria]
    );

    //  Relacionar con el dueño
    await connection.execute(
      'INSERT INTO DuenoEstablecimiento (idDueno, idEstablecimiento, fechaRegistro) VALUES (?, ?, NOW())',
      [value.idDueno, idEstablecimiento]
    );
    
    //  Consultar el registro completo recién creado
    const [establecimiento] = await connection.execute(`
      SELECT 
        e.idEstablecimiento,
        e.nombre,
        e.logoURL,
        e.activo,
        e.fechaRegistro,
        c.nombre AS categoria,
        d.idDueno,
        d.nombreUsuario AS nombreDueno
      FROM Establecimiento e
      LEFT JOIN CategoriaEstablecimiento ce ON e.idEstablecimiento = ce.idEstablecimiento
      LEFT JOIN Categoria c ON ce.idCategoria = c.idCategoria
      LEFT JOIN DuenoEstablecimiento de ON e.idEstablecimiento = de.idEstablecimiento
      LEFT JOIN Dueno d ON de.idDueno = d.idDueno
      WHERE e.idEstablecimiento = ?
    `, [idEstablecimiento]);

    console.log(`Establecimiento "${establecimiento[0].nombre}" creado correctamente`);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Establecimiento creado exitosamente',
        data: establecimiento[0]
      })
    };

  } catch (error) {
    console.error('Error creando establecimiento:', error);

    if (error.message.includes('Token') || error.message.includes('Acceso denegado')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: error.message })
      };
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Ya existe un establecimiento con ese nombre (restricción única).'
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al crear establecimiento',
        error: error.message
      })
    };
  }
};
