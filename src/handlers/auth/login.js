require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../../config/database');
const SECURITY_CONFIG = require('../../config/security');
const { checkRateLimit } = require('../../utils/ratelimit');
const Joi = require('joi');

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
    // 1. Rate Limiting
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

    // 2. Validación de entrada
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

    let user = null;
    let userType = null;
    let passwordHash = null;

    // 3. Buscar en Beneficiario
    const [beneficiarios] = await connection.execute(
      'SELECT idBeneficiario as id, email, passwordHash, primerNombre, apellidoPaterno, folio FROM Beneficiario WHERE email = ?',
      [email.toLowerCase()]
    );

    if (beneficiarios.length > 0) {
      user = beneficiarios[0];
      userType = 'beneficiario';
      passwordHash = user.passwordHash;
    }

    // 4. Si no existe, buscar en Dueno
    if (!user) {
      const [duenos] = await connection.execute(
        'SELECT idDueno as id, email, passwordHash, nombreUsuario FROM Dueno WHERE email = ?',
        [email.toLowerCase()]
      );

      if (duenos.length > 0) {
        user = duenos[0];
        userType = 'dueno';
        passwordHash = user.passwordHash;
      }
    }

    // 5. Si no existe, buscar en Administrador
    if (!user) {
      const [admins] = await connection.execute(
        'SELECT idAdministrador as id, email, masterPassword as passwordHash, nombreUsuario FROM Administrador WHERE email = ?',
        [email.toLowerCase()]
      );

      if (admins.length > 0) {
        user = admins[0];
        userType = 'administrador';
        passwordHash = user.passwordHash;
      }
    }

    // 6. Si no existe en ninguna tabla
    if (!user) {
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

    // 7. Verificar contraseña con bcrypt
    const isValidPassword = await bcrypt.compare(password, passwordHash);

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

    // 8. Generar JWT token con el role
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: userType
      },
      SECURITY_CONFIG.JWT_SECRET,
      { expiresIn: SECURITY_CONFIG.JWT_EXPIRES }
    );

    console.log(`Login successful for ${userType} ${user.id}`);

    // 9. Preparar respuesta según el tipo de usuario
    let userData = {
      id: user.id,
      email: user.email,
      role: userType
    };

    if (userType === 'beneficiario') {
      userData.nombre = `${user.primerNombre} ${user.apellidoPaterno}`;
      userData.folio = user.folio;
    } else {
      userData.nombreUsuario = user.nombreUsuario;
    }

    // 10. Respuesta exitosa
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Login exitoso',
        token,
        user: userData
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