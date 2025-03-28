require('dotenv').config();
const sql = require('mssql');
const realTimeStream = require('./realTimeStream'); // Assuming the library is saved as realTimeStream.js
const { connectToSQLServer } = require('./connectToSQLServer');
const { getCDCEntries } = require('./getCDCEntries');
const { configureRealTimeStream } = require('./configureRealTimeStream');

async function main() {
  try {
    console.log('Starting application...');
    const pool = await connectToSQLServer();
    const captureInstanceName = process.env.CAPTURE_INSTANCE_NAME; // Use environment variable
    console.log(pool)
    if (pool) {
      console.log('Fetching CDC entries...');
      // await getCDCEntries(pool, captureInstanceName);

      console.log('Configuring real-time stream...');
      configureRealTimeStream();
    }
  } catch (error) {
    console.error('Error in application:', error);
  }
}

main();
