import NodeClam from 'clamscan'

const options = {
  removeInfected: false,
  scanRecursively: false,
  debug_mode: true,
  clamscan: {
    path: '/usr/bin/clamscan', // Path to clamscan binary on your server
    db: null, // Path to a custom virus definition database
    scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
    active: true // If true, this module will consider using the clamscan binary
  },
  clamdscan: {
    socket: null,
    host: 'host.docker.internal',
    config_file: '/etc/clamav/clamd.conf',
    port: 3310,
    timeout: 60000,
    localFallback: true,
    multiscan: true,
    active: true,
    path: '/usr/bin/clamdscan'
  },
  preference: 'clamdscan'
}

const ClamScan = new NodeClam().init(JSON.parse(JSON.stringify(options)))

export default async function ScanFile (filename = 'eicar.com') {
  ClamScan.then(async (clamscan) => {
    try {
      const { file, isInfected, viruses } = await clamscan.isInfected(`/scandir/${filename}`)
      console.log(file, isInfected, viruses)
    } catch (err) {
      console.log(err)
    }
  })
}

ScanFile()
