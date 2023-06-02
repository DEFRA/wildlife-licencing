import db from 'debug'
import { init, createServer } from './server.js'
import { initializeClamScan } from './services/virus-scan.js'
import fs from 'fs'

import { DEFRA_ID, REDIS } from '@defra/wls-connectors-lib'
import { cleanUpScanDir } from './services/clean-up.js'
import { DEFRA_IDM_CALLBACK } from './uris.js'

const debug = db('web-service:env')
const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)

// Warning -- may print sensitive info. Ensure disabled in production
debug(`Environment: ${JSON.stringify(process.env, null, 4)}`)

const prepare = async () => {
  await cleanUpScanDir()
  await REDIS.initialiseConnection()
  await initializeClamScan()
  await DEFRA_ID.initialise(DEFRA_IDM_CALLBACK.uri)
}

prepare()
  .then(() => createServer()
    .then(s => init(s)
      .catch(e => {
        console.error(e)
        process.exit(1)
      })))
