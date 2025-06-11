import { sql, config } from './config/db.js';

async function testConnection() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Conexión exitosa a la base de datos');
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    process.exit(1);
  }
}

testConnection();
