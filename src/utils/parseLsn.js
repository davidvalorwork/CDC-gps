// This function converts a buffer of binary data into a hexadecimal string representation
// prefixed with "0x". It is commonly used to parse Log Sequence Numbers (LSNs).
module.exports = function parseLsn(data) {
  let lsn = "0x"; // Initialize the LSN string with the "0x" prefix.
  
  // Iterate through each byte in the buffer.
  for (let i = 0; i < data.length; i++) {
    // Read the byte as an unsigned integer and convert it to a hexadecimal string.
    let hex = data.readUInt8(i).toString(16);
    
    // Ensure each hexadecimal value is two characters long by padding with a leading zero if necessary.
    if (hex.length < 2) hex = "0" + hex;
    
    // Append the hexadecimal value to the LSN string.
    lsn += hex;
  }
  
  // Return the complete LSN string.
  return lsn;
};
