import 'dotenv/config'
import NodeClam from 'clamscan'
import * as fs from 'fs'

const options = {
  clamdscan: {
    socket: null,
    host: process.env.CS_HOST,
    port: process.env.CS_PORT,
    timeout: parseInt(process.env.CS_TIMEOUT),
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
        const dir = `../..${process.env.SCANDIR}/${filename}`
        const { isInfected } = await clamscan.isInfected(dir)
        if (isInfected) {
          fs.unlinkSync(dir, err => {
            if (err) {
              console.error(err)
              throw err
            }
            console.log('The file was deleted.')
          })
        }
        return isInfected
      } catch (err) {
        console.error(err.message)
        throw new Error(err)
      }
    })
  } else {
    throw new Error('Please provide a filename.')
  }
}
