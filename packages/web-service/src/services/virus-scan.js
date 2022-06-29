import NodeClam from 'clamscan'

const options = {
  removeInfected: false,
  scanRecursively: false,
  clamscan: {
    path: '/usr/bin/clamscan', // Path to clamscan binary on your server
    db: null, // Path to a custom virus definition database
    scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
    active: true // If true, this module will consider using the clamscan binary
  },
  clamdscan: {
    socket: null,
    host: 'host.docker.internal',
    port: 3310,
    timeout: 60000,
    multiscan: false,
    active: true,
    path: '/usr/bin/clamdscan'
  },
  preference: 'clamdscan'
}

const ClamScan = new NodeClam().init(JSON.parse(JSON.stringify(options)))

export async function scanFile (filename) {
  return ClamScan.then(async (clamscan) => {
    if (filename.length > 0) {
      try {
        const { isInfected } = await clamscan.isInfected(`./${filename}`)
        return isInfected
      } catch (err) {
        console.error(err)
      }
    } else {
      throw new Error('File name must be provided')
    }
  })
}
