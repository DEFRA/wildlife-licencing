import fs from 'fs'
import { cleanUpScanDir } from './services/clean-up.js'

export const initializeScanDir = async () => {
  // If the directory doesn't exist to hold our files we need to scan, create it
  if (!fs.existsSync(process.env.SCANDIR)) {
    console.log(`Created scan directory: ${process.env.SCANDIR}`)
    fs.mkdirSync(process.env.SCANDIR)
  } else {
    console.log(`Scan directory exists: ${process.env.SCANDIR}`)
    await cleanUpScanDir()
  }
}
