const pool = require('./db'); // Importa la conexión

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conectado a PostgreSQL:', result.rows[0]);

    // No cierres el pool aquí si planeas reutilizarlo en otras partes
  } catch (err) {
    console.error('Error conectando a PostgreSQL:', err);
  }
}

testConnection();
