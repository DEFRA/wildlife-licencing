const POSTGRES_USER = process.env.POSTGRES_USER
const POSTGRES_PW = process.env.POSTGRES_PW
const POSTGRES_DB = process.env.POSTGRES_DB
const POSTGRES_HOST = process.env.POSTGRES_HOST
const POSTGRES_PORT = process.env.POSTGRES_PORT ? process.env.POSTGRES_PORT : 5432

module.exports = {
  development: {
    username: POSTGRES_USER,
    password: POSTGRES_PW,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres',
    ...(process.env?.POSTGRES_NOSSL !== 'true' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  },
  test: {
    username: POSTGRES_USER,
    password: POSTGRES_PW,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres',
    ...(process.env?.POSTGRES_NOSSL !== 'true' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  },
  production: {
    username: POSTGRES_USER,
    password: POSTGRES_PW,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres',
    ...(process.env?.POSTGRES_NOSSL !== 'true' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  }
}
