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

Update the `connectToSQLServer` function in `index.js` with your SQL Server credentials:
```javascript
const config = {
  user: 'your_username',
  password: 'your_password',
  server: 'your_server',
  database: 'your_database',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};
```

## Usage

Run the application:
```bash
node index.js
```

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