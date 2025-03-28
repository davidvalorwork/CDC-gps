const sql = require('mssql');

async function connectToSQLServer() {
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  };

  try {
    console.log('Connecting to SQL Server...');
    const pool = await sql.connect(config);
    console.log('Connected to SQL Server successfully!');
    return pool;
  } catch (err) {
    console.error('Error connecting to SQL Server:', err);
    throw err;
  }
}

module.exports = { connectToSQLServer };
