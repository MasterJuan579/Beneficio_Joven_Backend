const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    // REEMPLAZA CON TUS CREDENCIALES DE AURORA
    const connection = await mysql.createConnection({
      host: 'db-beneficio-joven.cduggeegs0kv.us-east-1.rds.amazonaws.com',
      user: 'admin', 
      password: 'Bn7QZb}~]rnxPw%',
      database: 'BeneficioJoven',
      ssl: { rejectUnauthorized: false }
    });

    console.log('Conexión exitosa a Aurora RDS');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Query test:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('Error de conexión:', error.message);
  }
}

testConnection();