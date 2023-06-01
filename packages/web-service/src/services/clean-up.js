import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { CLEANUP_SCANDIR_INTERVAL, CLEANUP_SCANDIR_DAYS } from '../constants.js'

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const unlink = promisify(fs.unlink)

const removeOldFiles = async (directoryPath, days) => {
  const files = await readdir(directoryPath)
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - days)

  for (const file of files) {
    const filePath = path.join(directoryPath, file)
    const fileStat = await stat(filePath)

    if (fileStat.isFile() && fileStat.mtime < currentDate) {
      await unlink(filePath)
      console.log(`Deleted temporary file: ${filePath}`)
    }
  }
}

export const intervalFunc = () => {
  removeOldFiles(process.env.SCANDIR, CLEANUP_SCANDIR_DAYS)
    .then(() => console.log('Cleaning up temporary files completed'))
    .catch((error) => console.error('Error: cleaning up temporary files', error))
}

// Run once, then daily
export const cleanUpScanDir = () => {
  intervalFunc()
  setInterval(intervalFunc, CLEANUP_SCANDIR_INTERVAL)
}
