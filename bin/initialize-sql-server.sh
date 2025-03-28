#!/bin/bash

# Pull and run SQL Server Docker container
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=1234" -p 1434:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2019-latest

# Wait for SQL Server to start
echo "Waiting for SQL Server to start..."
sleep 15

# Initialize the database and table
docker exec -i sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1434 -U sa -P 1234 <<EOF
-- Create database People
CREATE DATABASE People;
GO

-- Use People database
USE People;
GO

-- Create table person
CREATE TABLE person (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50),
    lastname NVARCHAR(50),
    document NVARCHAR(20)
);
GO

-- Insert 3 random persons
INSERT INTO person (name, lastname, document) VALUES ('John', 'Doe', '123456789');
INSERT INTO person (name, lastname, document) VALUES ('Jane', 'Smith', '987654321');
INSERT INTO person (name, lastname, document) VALUES ('Alice', 'Johnson', '456789123');
GO

-- Enable CDC at the database level
EXEC sys.sp_cdc_enable_db;
GO

-- Enable CDC for the person table
EXEC sys.sp_cdc_enable_table
    @source_schema = N'dbo',
    @source_name = N'person',
    @role_name = NULL,
    @capture_instance = N'person_capture',
    @supports_net_changes = 1;
GO
EOF

# Define the connection string
CONNECTION_STRING="Server=localhost,1434;Database=People;User Id=sa;Password=1234;"

echo "SQL Server initialized with database 'People' and table 'person'. CDC enabled."
echo "Connection string: $CONNECTION_STRING"
