import 'dotenv/config'
import NodeClam from 'clamscan'
import * as fs from 'fs'

const options = {
  clamdscan: {
    socket: false,
    host: process.env.CS_HOST || 'host.docker.internal',
    port: process.env.CS_PORT || 3310,
    timeout: parseInt(process.env.CS_TIMEOUT) || 60000,
    multiscan: false,
    active: true
  },
  preference: 'clamdscan'
}
const ClamScan = new NodeClam().init(options)

export async function scanFile (filepath) {
  return ClamScan.then(async clamscan => {
    try {
      const { isInfected } = await clamscan.isInfected(filepath)
      if (isInfected) {
        fs.unlinkSync(filepath, err => {
          if (err) {
            console.error(err)
            throw err
          }
          console.log('The file contained a virus, so it was deleted.')
        })
      }
      return isInfected
    } catch (err) {
      console.error(err.message)
      fs.unlinkSync(filepath, delErr => {
        if (delErr) {
          console.error(delErr)
          throw delErr
        }
      })
      console.error(err.message)
      throw new Error(err)
    }
  })
}
