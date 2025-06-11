/**
 * Configuración de la conexión a la base de datos SQL Server
 * 
 * Este archivo maneja:
 * - Configuración de la conexión a SQL Server
 * - Creación y gestión del pool de conexiones
 * - Variables de entorno para credenciales y configuración
 * 
 * Las variables de entorno requeridas son:
 * - DB_SERVER: Servidor de la base de datos
 * - DB_USER: Usuario de la base de datos
 * - DB_PASSWORD: Contraseña del usuario
 * - DB_NAME: Nombre de la base de datos
 * - DB_PORT: Puerto de conexión
 */

import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Configuración de la conexión a SQL Server
 * Incluye:
 * - Servidor y puerto
 * - Credenciales de autenticación
 * - Opciones de la base de datos
 * - Configuración de encriptación
 */
const config = {
  server: process.env.DB_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    database: process.env.DB_NAME,
    encrypt: true,
    trustServerCertificate: true,
    port: parseInt(process.env.DB_PORT)
  }
};

/**
 * Pool de conexiones a la base de datos
 * Se crea una única instancia que se reutiliza en toda la aplicación
 * Maneja automáticamente:
 * - Conexiones y desconexiones
 * - Reconexiones automáticas
 * - Gestión de recursos
 */
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Conexión a SQL Server establecida');
    return pool;
  })
  .catch(err => console.log('Error de conexión a la base de datos:', err));

export { sql, config, poolPromise };