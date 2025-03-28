const sql = require('mssql');

async function getCDCEntries(pool, captureInstanceName) {
  try {
    console.log(`Getting CDC entries for capture instance: ${captureInstanceName}`);

    const query = `
      SELECT __$operation, __$start_lsn, __$update_mask, *
      FROM cdc.fn_cdc_get_all_changes_${captureInstanceName}
      WHERE __$operation = 2;
    `;

    const request = pool.request();
    const result = await request.query(query);
    console.log(`INSERT records for ${captureInstanceName}:`);
    result.recordset.forEach(row => {
      console.log(`LSN: ${row.__$start_lsn}, INSERT data:`, row);
    });
    return result.recordset;
  } catch (err) {
    console.error('Error fetching CDC data:', err);
    throw err;
  }
}

module.exports = { getCDCEntries };
