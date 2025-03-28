require('dotenv').config();
const sql = require('mssql');
const Stream = require('stream').Stream;
const realTimeStream = require('./realTimeStream'); // Assuming the library is saved as realTimeStream.js

async function main() {
  try {
    const pool = await connectToSQLServer();
    const captureInstanceName = process.env.CAPTURE_INSTANCE_NAME; // Use environment variable

    if (pool) {
      await getCDCEntries(pool, captureInstanceName);

      // Configure and start the real-time stream
      const connStr = process.env.CONNECTION_STRING; // Use environment variable
      const schema = process.env.SCHEMA; // Use environment variable
      const tableName = process.env.TABLE_NAME; // Use environment variable
      const interval = parseInt(process.env.INTERVAL_MS, 10); // Use environment variable

      const stream = realTimeStream(connStr, schema, tableName, interval);
      stream.on('data', (data) => {
        console.log('Real-time data:', data);
      });

      stream.on('error', (err) => {
        console.error('Stream error:', err);
      });

      // Close the SQL connection when done
      await sql.close();
    }
  } catch (error) {
    console.error('Error en la aplicación:', error);
  }
}

async function connectToSQLServer() {
  const config = {
    user: process.env.DB_USER, // Use environment variable
    password: process.env.DB_PASSWORD, // Use environment variable
    server: process.env.DB_SERVER, // Use environment variable
    database: process.env.DB_DATABASE, // Use environment variable
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  };

  try {
    const pool = await sql.connect(config);
    console.log('Conexión a SQL Server exitosa!');
    return pool;
  } catch (err) {
    console.error('Error al conectar a SQL Server:', err);
    throw err;
  }
}

async function getCDCEntries(pool, captureInstanceName) {
  try {
    const fromLsn = '0x00000000000000000000';
    const toLsnResult = await pool.request().query('SELECT sys.fn_cdc_get_max_lsn() AS max_lsn');
    const toLsnValue = toLsnResult.recordset[0].max_lsn;

    const query = `
      SELECT __$operation, __$start_lsn, __$update_mask, *
      FROM cdc.fn_cdc_get_all_changes_${captureInstanceName}(@from_lsn, @to_lsn, 'all')
      WHERE __$operation = 2
    `;

    const request = pool.request();
    request.input('from_lsn', sql.VarBinary(10), fromLsn);
    request.input('to_lsn', sql.VarBinary(10), toLsnValue);

    const result = await request.query(query);
    console.log(`Registros de INSERT para ${captureInstanceName}:`);
    result.recordset.forEach(row => {
      console.log(`LSN: ${row.__$start_lsn}, Datos del INSERT:`, row);
    });
    return result.recordset;
  } catch (err) {
    console.error('Error al obtener datos de CDC:', err);
    throw err;
  }
}

main();