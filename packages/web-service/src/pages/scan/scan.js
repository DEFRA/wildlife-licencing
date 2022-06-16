import NodeClam from 'clamscan'
const ClamScan = new NodeClam().init({
  removeInfected: false,
  clamdscan: {
    socket: false,
    host: 'host.docker.internal',
    port: 3310,
    timeout: 60000
  },
  preference: 'clamdscan'
})

ClamScan.then(async clamscan => {
  try {
    const {isInfected, file, viruses} = await clamscan.isInfected('../../virus.txt')
    console.log(isInfected, file, viruses)
  } catch (err) {
    console.log(err)
  }
})
