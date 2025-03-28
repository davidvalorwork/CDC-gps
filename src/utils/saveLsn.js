var sql = require('msnodesql');

// Function to save the LSN (Log Sequence Number) for a specific database and table
module.exports = function saveLsn(dbname, tblname, lsn, cb) {
  // Connection string for the SQL Server database
  const sqlcdcConnStr = "Driver={SQL Server Native Client 11.0};Server=(local);Database=sqlcdc;Trusted_Connection={Yes}";
  console.log("Connection string initialized.");

  // SQL MERGE query to update or insert the LSN for the specified database and table
  const mergeQuery = `
    MERGE INTO [sqlcdc].[dbo].[tablestatus] AS target
    USING (SELECT '${dbname}' AS dbname, '${tblname}' AS tblname) AS source
    ON target.databasename = source.dbname AND target.tablename = source.tblname
    WHEN MATCHED THEN UPDATE SET currentLSN = ${lsn}
    WHEN NOT MATCHED THEN INSERT (databasename, tablename, currentLSN)
    VALUES (source.dbname, source.tblname, ${lsn});
  `;
  console.log("Merge query constructed:", mergeQuery);

  // Execute the query
  const stmt = sql.query(sqlcdcConnStr, mergeQuery);
  console.log("Query execution started.");

  // Handle errors during query execution
  stmt.on('error', (err) => {
    console.error("Error during query execution:", err);
    cb(err);
  });

  // Handle successful query execution
  stmt.on('done', () => {
    console.log("Query execution completed successfully.");
    cb();
  });
};
