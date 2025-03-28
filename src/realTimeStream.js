var Stream = require('stream').Stream;
var sql = require('msnodesql');
const parseLsn = require('./utils/parseLsn');
const saveLsn = require('./utils/saveLsn');
const validateTable = require('./utils/validateTable');

module.exports = function (conn_str, schema, tblname, interval) {
  // Validate the table before proceeding
  validateTable(conn_str, tblname);

  // Extract the database name from the connection string
  const dbnameMatch = conn_str.toLowerCase().match(/database=([^;]*);/);
  const dbname = dbnameMatch ? dbnameMatch[1] : null;
  if (!dbname) throw new Error("Database name not found in connection string.");

  let ldn = 0; // Last Data Number (LSN)

  const stream = new Stream();
  stream.readable = true;

  const intervalId = setInterval(() => {
    console.log(`Executing CDC query for table: ${tblname}, LSN: ${ldn}`);
    const cdcQuery = `
      SELECT * FROM cdc.${schema}_${tblname}_CT
      WHERE __$start_lsn > ${ldn}
    `;

    const stmt = sql.query(conn_str, cdcQuery);
    let metadata = [];
    let currentObject = {};

    stmt.on('meta', (meta) => {
      console.log('Received metadata:', meta);
      metadata = meta;
    });

    stmt.on('row', () => {
      console.log('New row detected');
      currentObject = {};
    });

    stmt.on('column', (idx, data) => {
      console.log(`Processing column index: ${idx}, data: ${data}`);
      if (idx === 0) {
        ldn = parseLsn(data); // Parse the LSN from the first column
        console.log(`Updated LSN: ${ldn}`);
      }
      currentObject[metadata[idx].name] = data;

      if (idx === metadata.length - 1) {
        console.log('Row fully processed, saving LSN...');
        saveLsn(dbname, tblname, ldn, (err) => {
          if (err) {
            console.error('Error saving LSN:', err);
            stream.emit('error', err);
            clearInterval(intervalId);
          } else {
            currentObject.tablename = tblname;
            console.log('Emitting data:', currentObject);
            stream.emit('data', JSON.stringify(currentObject));
          }
        });
      }
    });

    stmt.on('error', (err) => {
      console.error('Statement error:', err);
      stream.emit('error', err);
    });
  }, interval);

  stream.end = function (data) {
    if (data) stream.write(data);
    console.log('Stream ended');
    stream.emit('end');
  };

  stream.destroy = function () {
    console.log('Stream destroyed');
    clearInterval(intervalId);
    stream.emit('close');
  };

  return stream;
};
