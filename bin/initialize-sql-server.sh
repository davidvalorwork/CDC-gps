#!/bin/bash

# Pull and run SQL Server Docker container
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=StrongP@ssw0rd" -p 1434:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2019-latest

# Enable TCP/IP connections
docker exec -u root -it sqlserver bash -c "/opt/mssql/bin/mssql-conf set network.tcpenabled 1"
docker exec -u root -it sqlserver bash -c "systemctl restart mssql-server"

# Wait for SQL Server to start
echo "Waiting for SQL Server to start..."
sleep 10


# Initialize the database and table
docker exec -i sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost,1434 -U sa -P StrongP@ssw0rd <<EOF
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

# Define the connection string for msnodesqlv8
CONNECTION_STRING="Driver={SQL Server Native Client 11.0};Server=(local);Database=DB_NAME;Trusted_Connection={Yes};"

echo "SQL Server initialized with database 'People' and table 'person'. CDC enabled."
