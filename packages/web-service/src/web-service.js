import db from 'debug'
import { init, createServer } from './server.js'
import { initializeClamScan } from './services/virus-scan.js'
import fs from 'fs'

import { ADDRESS, REDIS, ERRBIT } from '@defra/wls-connectors-lib'
import { initializeScanDir } from './initialization.js'

ERRBIT.initialize('Web service')

const debug = db('web-service:env')
const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)

// Warning -- may print sensitive info. Ensure disabled in production
debug(`Environment: ${JSON.stringify(process.env, null, 4)}`)

const prepare = async () => {
  await initializeScanDir()
  await initializeClamScan()
  await REDIS.initialiseConnection()
  await ADDRESS.initialize()
}

prepare()
  .then(() => createServer()
    .then(s => init(s).catch(e => {
      console.error(e)
      process.exit(1)
    })))
