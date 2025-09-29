// Almacén temporal de intentos (en producción usarías Redis/DynamoDB)
const attempts = new Map();

const checkRateLimit = (identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const userAttempts = attempts.get(identifier);

  if (!userAttempts) {
    attempts.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Resetear si pasó el tiempo
  if (now > userAttempts.resetTime) {
    attempts.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Incrementar contador
  userAttempts.count++;

  if (userAttempts.count > maxAttempts) {
    const timeLeft = Math.ceil((userAttempts.resetTime - now) / 1000 / 60);
    return { 
      allowed: false, 
      remaining: 0,
      message: `Demasiados intentos. Intenta de nuevo en ${timeLeft} minutos.`
    };
  }

  return { 
    allowed: true, 
    remaining: maxAttempts - userAttempts.count 
  };
};

module.exports = { checkRateLimit };