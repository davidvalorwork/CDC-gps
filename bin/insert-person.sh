#!/bin/bash

# Use the current timestamp for reproducibility
TIMESTAMP=$(date +%s)

# Generate values for the new person using the timestamp
NAME="Person$((TIMESTAMP % 10000))"
LASTNAME="Lastname$((TIMESTAMP % 10000))"
DOCUMENT="$((TIMESTAMP % 10000))$((TIMESTAMP % 10000))"

# Insert the new person into the person table
docker exec -i sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1434 -U sa -P 1234 <<EOF
USE People;
GO
INSERT INTO person (name, lastname, document) VALUES ('$NAME', '$LASTNAME', '$DOCUMENT');
GO
EOF

echo "Inserted new person: Name='$NAME', Lastname='$LASTNAME', Document='$DOCUMENT', DOB='$DOB'."
