# CDC SQL Server Node.js Project

This project demonstrates how to connect to a SQL Server database and retrieve Change Data Capture (CDC) entries using Node.js.

## Prerequisites

- Node.js installed on your system.
- A SQL Server instance with CDC enabled on the desired table.

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd cdc
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

## Dependencies

The project uses the following dependencies:
- `mssql`: A Microsoft SQL Server client for Node.js.

## Configuration

Create a `.env` file in the root directory and add your SQL Server credentials and other configuration values:
```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_SERVER=your_server
DB_DATABASE=your_database
CAPTURE_INSTANCE_NAME=NombreDeTuTabla_capture
CONNECTION_STRING=your_connection_string
SCHEMA=your_schema
TABLE_NAME=your_table_name
INTERVAL_MS=5000
```

The application will automatically load these values from the `.env` file.

## Usage

Run the application:
```bash
node index.js
```

## Database Initialization

To initialize the SQL Server database, run the provided script:

```bash
bash ./bin/initialize-sql-server.sh
```

This script will:
1. Start a SQL Server instance using Docker with the username `sa` and password `1234`.
2. Create a database named `People`.
3. Create a table `person` with columns `name`, `lastname`, and `document`.
4. Insert 3 random persons into the `person` table.
5. Enable Change Data Capture (CDC) for the `People` database and the `person` table.

## Insert a New Person

To insert a new person with distinct values into the `person` table, run the standalone script:

```bash
bash ./bin/insert-person.sh
```

This script will:
1. Generate random values for `name`, `lastname`, and `document`.
2. Insert the new person into the `person` table in the `People` database.

## Activación de CDC en SQL Server para una Tabla Específica y Configuración de Rol para Consultar Solo Inserts

### Pasos para Activar CDC en una Tabla Específica

1. **Habilitar CDC a Nivel de Base de Datos:**
   ```sql
   USE [NombreDeTuBaseDeDatos];
   GO
   EXEC sys.sp_cdc_enable_db;
   GO
   ```

2. **Habilitar CDC para la Tabla Específica:**
   ```sql
   USE [NombreDeTuBaseDeDatos];
   GO
   EXEC sys.sp_cdc_enable_table
   @source_schema = N'dbo',
   @source_name   = N'NombreDeTuTabla',
   @role_name     = NULL,
   @capture_instance = N'NombreDeTuTabla_capture',
   @supports_net_changes = 1;
   GO
   ```

### Crear un Rol de Base de Datos para Consultar los Cambios

```sql
USE [NombreDeTuBaseDeDatos];
GO
CREATE ROLE [cdc_lector_tabla];
GO
GRANT SELECT ON SCHEMA :: cdc TO [cdc_lector_tabla];
GO
GRANT SELECT ON [cdc].[fn_cdc_get_net_changes_NombreDeTuTabla_capture] TO [cdc_lector_tabla];
GO
GRANT SELECT ON [cdc].[fn_cdc_get_all_changes_NombreDeTuTabla_capture] TO [cdc_lector_tabla];
GO
GRANT SELECT ON OBJECT::cdc.change_tables TO [cdc_lector_tabla];
GRANT SELECT ON OBJECT::cdc.captured_columns TO [cdc_lector_tabla];
GO
```

## License

This project is licensed under the MIT License.