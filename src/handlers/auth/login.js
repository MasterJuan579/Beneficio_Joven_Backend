require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../../config/database');
const SECURITY_CONFIG = require('../../config/security');
const { checkRateLimit } = require('../../utils/ratelimit');
const Joi = require('joi');

// Validación con email y contraseña
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'string.empty': 'El email es requerido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.empty': 'La contraseña es requerida',
    'any.required': 'La contraseña es requerida'
  })
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
    // 1. Rate Limiting - protege contra ataques de fuerza bruta
    const ip = event.requestContext?.identity?.sourceIp || 'unknown';
    const rateLimitResult = checkRateLimit(ip, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS);
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          success: false,
          message: rateLimitResult.message
        })
      };
    }

    // 2. Validación de entrada - previene datos malformados
    const body = JSON.parse(event.body);
    const { error, value } = loginSchema.validate(body);
    
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

    const { email, password } = value;
    const connection = await getConnection();

    // 3. Buscar usuario por email
    const [rows] = await connection.execute(
      'SELECT idBeneficiario, email, passwordHash, primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, folio FROM Beneficiario WHERE email = ?',
      [email.toLowerCase()] // Normalizar email a minúsculas
    );

    if (rows.length === 0) {
      console.log(`Login failed: User not found for email ${email}`);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email o contraseña incorrectos'
        })
      };
    }

    const user = rows[0];

    // 4. Verificar contraseña con bcrypt - comparación segura
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      console.log(`Login failed: Invalid password for email ${email}`);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email o contraseña incorrectos'
        })
      };
    }

    // 5. Generar JWT token seguro
    const token = jwt.sign(
      { 
        id: user.idBeneficiario,
        email: user.email,
        folio: user.folio,
        role: 'beneficiario'
      },
      SECURITY_CONFIG.JWT_SECRET,
      { expiresIn: SECURITY_CONFIG.JWT_EXPIRES }
    );

    console.log(`Login successful for user ${user.idBeneficiario}`);

    // 6. Respuesta exitosa (NO enviar datos sensibles)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id: user.idBeneficiario,
          nombre: `${user.primerNombre} ${user.apellidoPaterno}`,
          email: user.email,
          folio: user.folio
        }
      })
    };

  } catch (error) {
    console.error('Error en login:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error interno del servidor'
      })
    };
  }
};