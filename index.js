const sql = require('mssql');

async function main() {
  try {
    const pool = await connectToSQLServer();
    const captureInstanceName = 'NombreDeTuTabla_capture'; // Reemplaza con tu nombre de instancia

    if (pool) {
      await getCDCEntries(pool, captureInstanceName);
      await sql.close();
    }
  } catch (error) {
    console.error('Error en la aplicación:', error);
  }
}

async function connectToSQLServer() {
  const config = {
    user: 'your_username',
    password: 'your_password',
    server: 'your_server',
    database: 'your_database',
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