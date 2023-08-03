export default {
  api: {
    host: process.env.API_HOST,
    port: process.env.API_PORT,
    timeout: process.env.REQUEST_TIMEOUT_MS
  },
  aws: {
    region: process.env.AWS_REGION,
    s3: {
      endpoint: process.env.AWS_S3_ENDPOINT,
      bucket: process.env.AWS_S3_BUCKET
    },
    secretsManager: {
      endpoint: process.env.AWS_SM_ENDPOINT
    }
  },
  pg: {
    user: process.env.POSTGRES_USER,
    pw: process.env.POSTGRES_PW,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    logging: process.env.POSTGRES_LOGGING
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    database: process.env.REDIS_DATABASE,
    password: process.env.REDIS_PASSWORD
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
    tokenExpireWindow: process.env.TOKEN_EXPIRE_WINDOW_SECONDS,
    scope: process.env.MSPA_SCOPE,
    client: {
      url: process.env.MSPA_CLIENT_URL,
      timeout: process.env.MSPA_CLIENT_TIMEOUT_MS,
      fetchSize: process.env.MPSA_FETCH_SIZE
    }
  },
  defraId: {
    baseUrl: process.env.DEFRA_ID_BASE_URL,
    serviceId: process.env.DEFRA_ID_SERVICE_ID,
    configPath: process.env.DEFRA_ID_OPENID_CONFIG_PATH,
    managementPath: process.env.DEFRA_ID_MANAGEMENT_PATH,
    secret: process.env.DEFRA_ID_SECRET,
    clientId: process.env.DEFRA_ID_CLIENT_ID,
    redirectBase: process.env.DEFRA_ID_REDIRECT_BASE,
    policy: process.env.DEFRA_ID_POLICY
  },
  graph: {
    base: process.env.GRAPH_BASE,
    tenant: process.env.OAUTH_TENANT
  },
  sharepoint: {
    root: process.env.SHAREPOINT_ROOT,
    site: process.env.SHAREPOINT_SITE
  },
  address: {
    url: process.env.ADDRESS_LOOKUP_URL,
    certificateParam: process.env.ADDRESS_LOOKUP_CERTIFICATE_PARAMETER,
    keyParam: process.env.ADDRESS_LOOKUP_KEY_PARAMETER,
    timeout: process.env.ADDRESS_LOOKUP_TIMEOUT_MS
  },
  errbit: {
    host: process.env.ERRBIT_HOST,
    projectId: process.env.ERRBIT_PROJECT_ID,
    projectKey: process.env.ERRBIT_PROJECT_KEY,
    environment: process.env.ERRBIT_ENVIRONMENT
  }
}
