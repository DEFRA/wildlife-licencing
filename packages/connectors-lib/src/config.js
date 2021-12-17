export default {
  aws: {
    region: process.env.AWS_REGION,
    s3: {
      endpoint: process.env.AWS_S3_ENDPOINT
    },
    secretsManager: {
      endpoint: process.env.AWS_SECRETS_MANAGER_ENDPOINT
    }
  },
  pg: {
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    pw: process.env.POSTGRES_PW,
    logging: process.env.POSTGRES_LOGGING
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    database: process.env.REDIS_DATABASE
  },
  queue: {
    host: process.env.REDIS_QUEUE_HOST,
    port: process.env.REDIS_QUEUE_PORT,
    database: process.env.REDIS_QUEUE_DATABASE
  },
  powerApps: {
    oauth: {
      client: {
        id: process.env.MSPA_CLIENT_ID,
        secret: process.env.MSPA_SECRET
      },
      auth: {
        tokenHost: process.env.OAUTH_AUTHORITY_HOST_URL,
        tokenPath: `${process.env.OAUTH_TENANT}/oauth2/v2.0/token`,
        authorizePath: `${process.env.OAUTH_TENANT}/oauth2/v2.0/authorize`
      }
    },
    scope: process.env.MSPA_SCOPE
  }
}
