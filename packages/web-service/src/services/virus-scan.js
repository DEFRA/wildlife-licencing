import NodeClam from 'clamscan'
import * as fs from 'fs'

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
  try {
    // const cs = new NodeClam()
    // clamScan = await cs.init(options)
    // if (clamScan.initialized) {
    //   console.log('clam virus scanner container is initialized')
    // } else {
    //   console.error('Clam virus scanner container is not initialized')
    //   return Promise.reject(new Error(`Error initializing clam. Options: ${JSON.stringify(options)}`))
    // }
    // return Promise.resolve()
  } catch (err) {
    console.error(err)
    return Promise.reject(new Error(`Error initializing clam. Options: ${JSON.stringify(options)}`))
  }
}

export async function scanFile (filepath) {
  try {
    const { isInfected } = await clamScan.isInfected(filepath)
    if (isInfected) {
      fs.unlinkSync(filepath)
    }
    return isInfected
  } catch (err) {
    console.error(err.message)
    fs.unlinkSync(filepath)
    throw new Error(err)
  }
}
