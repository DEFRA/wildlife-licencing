// All environments use environment variables for db config, so we define a single config that we use in every
// environment, knowing that the settings that differ between environments will be pulled from the env vars.
const config = {
  dialect: 'postgres',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PW,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT ? process.env.POSTGRES_PORT : 5432,
  // We expect all our dbs to use ssl but connectors-lib sets the ssl options based on whether POSTGRES_NOSSL is set to
  // `true` so we follow suit here; it may be required when running locally for example.
  ...(process.env?.POSTGRES_NOSSL !== 'true' && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })
}

module.exports = {
  development: config,
  test: config,
  production: config
}
