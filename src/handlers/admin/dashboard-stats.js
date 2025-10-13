require('dotenv').config();
const { getConnection } = require('../../config/database');
const { verifyRole } = require('../../middleware/auth');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Verificar que sea administrador
    const user = verifyRole(event, ['administrador']);
    
    console.log(`Admin ${user.id} (${user.email}) solicitó estadísticas del dashboard`);
    
    const connection = await getConnection();

    // Ejecutar queries en paralelo para mejor performance
    const [
      [beneficiarios],
      [comercios],
      [descuentos]
    ] = await Promise.all([
      connection.execute('SELECT COUNT(*) as total FROM Beneficiario'),
      connection.execute('SELECT COUNT(*) as total FROM Establecimiento'),
      connection.execute('SELECT COUNT(*) as total FROM Promocion WHERE esVigente = TRUE')
    ]);

    console.log('Beneficiarios:', beneficiarios[0].total);
    console.log('Comercios:', comercios[0].total);
    console.log('Descuentos:', descuentos[0].total);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          beneficiariosRegistrados: beneficiarios[0].total,
          comerciosAfiliados: comercios[0].total,
          descuentosDadosAlta: descuentos[0].total
        }
      })
    };

  } catch (error) {
    console.error('ERROR COMPLETO:', error);

    // Manejar errores de autenticación
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

    // Errores generales del servidor
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      })
    };
  }
};