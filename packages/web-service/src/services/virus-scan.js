import 'dotenv/config'
import NodeClam from 'clamscan'
import * as fs from 'fs'

const options = {
  clamdscan: {
    socket: null,
    host: process.env.CS_HOST || 'host.docker.internal',
    port: process.env.CS_PORT || 3310,
    timeout: 60000,
    multiscan: false,
    active: true
  },
  preference: 'clamdscan'
}

const ClamScan = new NodeClam().init(options)

export async function scanFile (filename) {
  if (filename) {
    return ClamScan.then(async (clamscan) => {
      try {
        const dir = `./${filename}`
        const { isInfected } = await clamscan.isInfected(dir)
        if (isInfected) {
          fs.unlinkSync(dir, err => {
            if (err) throw err
            console.log('the file was deleted.')
          })
        }
        return isInfected
      } catch (err) {
        throw new Error(err)
      }
})
  } else {
    throw new Error('Needs a filename')
  }
}
