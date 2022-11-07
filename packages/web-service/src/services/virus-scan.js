import NodeClam from 'clamscan'
import * as fs from 'fs'
import db from 'debug'
import { Boom } from '@hapi/boom'
const debug = db('web-service:clam')

const options = {
  clamdscan: {
    socket: false,
    host: process.env.CS_HOST,
    port: process.env.CS_PORT || 3310,
    timeout: parseInt(process.env.CS_TIMEOUT) || 60000,
    multiscan: false,
    active: true
  },
  preference: 'clamdscan'
}

let clamScan

export const initializeClamScan = async () => {
  // If you run an M1 based architecture, the clamscan image doesn't currently work when developing locally
  // env var makes it more configurable to just turn it off when debugging
  if (!process.env.NO_SCANNING_REQUIRED) {
    debug(`Scanning required. Options${JSON.stringify(options)}`)
    try {
      const cs = new NodeClam()
      clamScan = await cs.init(options)
      if (clamScan.initialized) {
        debug('clam virus scanner container is initialized')
      } else {
        console.error('Clam virus scanner container is not initialized')
        return Promise.reject(new Error(`Error initializing clam. Options: ${JSON.stringify(options)}`))
      }
      return Promise.resolve()
    } catch (err) {
      console.error(err)
      return Promise.reject(new Error(`Error initializing clam. Options: ${JSON.stringify(options)}`))
    }
  } else {
    debug('virus scanner is disabled')
  }

  return undefined
}

export async function scanFile (filepath) {
  try {
    const { isInfected } = await clamScan.isInfected(filepath)
    return isInfected
  } catch (err) {
    console.error(err.message)
    fs.unlinkSync(filepath)
    Boom.boomify(err, { statusCode: 500 })
    throw new Error(err)
  }
}
