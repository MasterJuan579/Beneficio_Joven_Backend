// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const SECURITY_CONFIG = require('../config/security');

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y extrae la información del usuario
 */
const verifyToken = (event) => {
  try {
    // 1. Extraer el token del header Authorization
    const authHeader = event.headers?.Authorization || 
                       event.headers?.authorization;
    
    if (!authHeader) {
      throw new Error('No se proporcionó token de autenticación');
    }

    // 2. Remover el prefijo "Bearer " del token
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      throw new Error('Token inválido');
    }

    // 3. Verificar y decodificar el token
    const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_SECRET);
    
    // 4. Validar que el token tenga la estructura mínima esperada
    if (!decoded.id || !decoded.email || !decoded.role) {
      throw new Error('Token con estructura inválida');
    }

    // 5. Retornar la información del usuario
    // Nota: folio solo existe para beneficiarios, es opcional
    return {
      id: decoded.id,
      email: decoded.email,
      folio: decoded.folio || null, // ← CAMBIO: folio es opcional
      role: decoded.role
    };
    
  } catch (error) {
    // Manejar diferentes tipos de errores de JWT
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente');
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    
    // Otros errores
    throw error;
  }
};

/**
 * Middleware para verificar roles específicos
 * Verifica que el usuario tenga uno de los roles permitidos
 */
const verifyRole = (event, allowedRoles = []) => {
  const user = verifyToken(event);
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}`);
  }
  
  return user;
};

module.exports = { 
  verifyToken,
  verifyRole
};