require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getConnection } = require('../../config/database');
const SECURITY_CONFIG = require('../../config/security');
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.pattern.base': 'La contraseña debe contener mayúsculas, minúsculas y números'
  }),
  primerNombre: Joi.string().required(),
  segundoNombre: Joi.string().allow('', null),
  apellidoPaterno: Joi.string().required(),
  apellidoMaterno: Joi.string().required(),
  curp: Joi.string().length(18).required(),
  fechaNacimiento: Joi.date().required(),
  celular: Joi.string().length(10).pattern(/^\d{10}$/).required(),
  sexo: Joi.string().valid('H', 'M').required()
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
    const { error, value } = registerSchema.validate(body);
    
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

    // Verificar si el email ya existe
    const [existing] = await connection.execute(
      'SELECT idBeneficiario FROM Beneficiario WHERE email = ? OR curp = ?',
      [value.email.toLowerCase(), value.curp]
    );

    if (existing.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'El email o CURP ya está registrado'
        })
      };
    }

    // Hash de la contraseña con bcrypt
    const passwordHash = await bcrypt.hash(value.password, SECURITY_CONFIG.BCRYPT_ROUNDS);

    // Generar folio único
    const folio = `BJ${Date.now().toString().slice(-8)}`;

    // Insertar usuario
    await connection.execute(
      `INSERT INTO Beneficiario 
      (curp, primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno, 
       fechaNacimiento, celular, folio, email, passwordHash, fechaRegistro, sexo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        value.curp,
        value.primerNombre,
        value.segundoNombre || null,
        value.apellidoPaterno,
        value.apellidoMaterno,
        value.fechaNacimiento,
        value.celular,
        folio,
        value.email.toLowerCase(),
        passwordHash,
        value.sexo
      ]
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Usuario registrado exitosamente',
        folio
      })
    };

  } catch (error) {
    console.error('Error en registro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error interno del servidor :(',
        error: error.message
      })
    };
  }
};