import db from 'debug'
import { init, createServer } from './server.js'
import { initializeClamScan } from './services/virus-scan.js'
import fs from 'fs'

import { REDIS } from '@defra/wls-connectors-lib'

const debug = db('web-service:env')
const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)

// Warning -- may print sensitive info. Ensure disabled in production
debug(`Environment: ${JSON.stringify(process.env, null, 4)}`)

REDIS.initialiseConnection()
  .then(() => initializeClamScan()
    .then(() => createServer()
      .then(s => init(s).catch(e => {
        console.error(e)
        process.exit(1)
      }))))
