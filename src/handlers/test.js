require('dotenv').config();
const { getConnection } = require('../config/database');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    console.log('Intentando conectar a la base de datos...');
    console.log('DB_HOST:', process.env.DB_HOST ? 'Configurado' : 'NO configurado');
    
    const connection = await getConnection();
    
    // Test simple de conexión
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Query test exitosa:', rows);
    
    // Verificar que existen las tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tablas encontradas:', tables.length);
    
    // Verificar estructura de Beneficiario
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM Beneficiario LIKE 'email'"
    );
    
    const emailExists = columns.length > 0;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Conexión exitosa a BD',
        details: {
          connected: true,
          tablesCount: tables.length,
          emailColumnExists: emailExists
        }
      })
    };
    
  } catch (error) {
    console.error('Error de conexión:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error de conexión a BD',
        error: error.message,
        code: error.code
      })
    };
  }
};