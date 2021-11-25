import Config from './config.js'
import * as pg from 'pg'
import { SECRETS } from './secrets.js'
import { endProcess } from './utils.js'
const { Pool } = pg.default

let connectedPool

export const DATABASE = {
  getPool: () => connectedPool,
  initialiseConnection: async () => {
    if (connectedPool) {
      return connectedPool
    }

    // Attempt to get postrges password from the secrets manager unless set as the environment variable
    const connection = {
      user: Config.pg.user,
      host: Config.pg.host,
      database: Config.pg.database,
      password: Config.pg.pw || await SECRETS.getSecret('/wls/postgres-password'),
      port: Config.pg.port
    }

    connectedPool = new Pool(connection)
    connectedPool.on('error', endProcess)

    // Test the connection. If the db is not available terminate the process
    try {
      const client = await connectedPool.connect()
      await client.query('SELECT NOW()')
      client.release()
    } catch (e) {
      console.error(e)
      process.exit(-1)
    }

    // Return the initialized connection
    return connectedPool
  }
}
