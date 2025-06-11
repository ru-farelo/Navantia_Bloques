import { sql, config } from '../config/db.js';

export async function ensureDatabaseAndTable() {
  // Conexión al servidor (sin base de datos, para crearla si no existe)
  const serverConfig = { ...config, options: { ...config.options } };
  delete serverConfig.options.database;

  const isDev = process.env.NODE_ENV === 'development';

  // 1. Crear base de datos si no existe
  const pool = await sql.connect(serverConfig);
  await pool.request().query(`
    IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'Api_Bloques')
    BEGIN
        CREATE DATABASE Api_Bloques;
    END
  `);

  // 2. Conectar a la base de datos para gestión de la tabla
  const poolDb = await sql.connect(config);

  if (isDev) {
    console.log('⚠️ Entorno de desarrollo detectado: se eliminará la tabla Bloques si existe.');
    await poolDb.request().query(`
      IF OBJECT_ID('dbo.Bloques', 'U') IS NOT NULL
      BEGIN
          DROP TABLE dbo.Bloques;
      END
    `);
  }

  // 3. Crear la tabla si no existe
  await poolDb.request().query(`
    IF OBJECT_ID('dbo.Bloques', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.Bloques (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            Bloque NVARCHAR(255),
            Localización NVARCHAR(255),
            Celda NVARCHAR(255),
            Situación NVARCHAR(255),
            Empresa NVARCHAR(255),
            Comentarios NVARCHAR(MAX),
            Latitud FLOAT,
            Longitud FLOAT,
            Ancho FLOAT,
            Alto FLOAT,
            Rotacion FLOAT,
            Tipo NVARCHAR(255)
        );
    END
  `);
}
