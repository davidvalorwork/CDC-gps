var sql = require('msnodesqlv8'); // Updated to use msnodesqlv8

// Function to validate if a table exists and has Change Data Capture (CDC) enabled
module.exports = function validateTable(conn_str, tblname) {
  // SQL query to check the table's existence and CDC status
  const validateTableQuery = `
    SELECT sys.schemas.name, sys.tables.name AS tablename, sys.tables.is_tracked_by_cdc
    FROM sys.schemas
    INNER JOIN sys.tables ON sys.schemas.schema_id = sys.tables.schema_id
    WHERE sys.tables.name = '${tblname}'
  `;

  console.log('Opening SQL connection...');
  sql.open(conn_str, function (err, conn) {
    if (err) {
      console.error('Error opening SQL connection:', err);
      throw new Error(err);
    }

    console.log('Executing query to validate table:', validateTableQuery);
    conn.query(validateTableQuery, function (err, results) { // Updated queryRaw to query
      if (err) {
        console.error('Error executing query:', err);
        throw new Error(err);
      }

      console.log('Query results:', results);
      if (results.length === 0) { // Adjusted for msnodesqlv8 result format
        console.error(`Table "${tblname}" does not exist.`);
        throw new Error(`Table "${tblname}" does not exist.`);
      }

      if (results[0].is_tracked_by_cdc !== 1) { // Adjusted for msnodesqlv8 result format
        console.error(`Change Data Capture for "${tblname}" is not enabled.`);
        throw new Error(`Change Data Capture for "${tblname}" is not enabled.`);
      }

      console.log(`Table "${tblname}" exists and has CDC enabled.`);
    });
  });
};
