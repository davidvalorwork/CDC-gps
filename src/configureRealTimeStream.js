var mystream = require('sqlcdc')
const realTimeStream = require('./realTimeStream');

function configureRealTimeStream() {
  try {
    const connStr = process.env.CONNECTION_STRING;
    const schema = process.env.SCHEMA;
    const tableName = process.env.TABLE_NAME;
    const interval = parseInt(process.env.INTERVAL_MS, 10);
    console.log(connStr)

    console.log('Starting real-time stream...');

    stream.on('data', (data) => {
      console.log('Real-time data:', data);
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
    });
  } catch (err) {
    console.error('Error configuring real-time stream:', err);
    throw err;
  }
}

module.exports = { configureRealTimeStream };
