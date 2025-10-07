require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getConnection } = require('../../config/database');
const SECURITY_CONFIG = require('../../config/security');
const Joi = require('joi');

const registerDuenoSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.pattern.base': 'La contraseña debe contener mayúsculas, minúsculas y números'
  }),
  nombreUsuario: Joi.string().min(3).max(50).required()
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

  try {
    const body = JSON.parse(event.body);
    const { error, value } = registerDuenoSchema.validate(body);
    
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

    // Verificar si el email o usuario ya existe
    const [existing] = await connection.execute(
      'SELECT idDueno FROM Dueno WHERE email = ? OR nombreUsuario = ?',
      [value.email.toLowerCase(), value.nombreUsuario]
    );

    if (existing.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'El email o nombre de usuario ya está registrado'
        })
      };
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(value.password, SECURITY_CONFIG.BCRYPT_ROUNDS);

    // Insertar dueño
    const [result] = await connection.execute(
      'INSERT INTO Dueno (nombreUsuario, email, passwordHash, fechaRegistro) VALUES (?, ?, ?, NOW())',
      [value.nombreUsuario, value.email.toLowerCase(), passwordHash]
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Dueño registrado exitosamente',
        idDueno: result.insertId
      })
    };

  } catch (error) {
    console.error('Error en registro de dueño:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      })
    };
  }
};