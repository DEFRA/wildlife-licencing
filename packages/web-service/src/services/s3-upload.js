import fs from 'fs'
import { AWS } from '@defra/wls-connectors-lib'
import { boomify } from '@hapi/boom'
import { v4 as uuidv4 } from 'uuid'
import db from 'debug'
import { APIRequests } from './api-requests.js'
const debug = db('web-service:s3')

export const s3FileUpload = async (applicationId, filename, filepath, filetype) => {
  const { writeFileStream } = AWS.S3
  const fileReadStream = fs.createReadStream(filepath)

  // The filename will be recorded by the API
  const objectKey = uuidv4()

  try {
    await writeFileStream(objectKey, fileReadStream)
    debug(`Wrote file ${filename} with key: ${objectKey}`)

    // Record the file upload on the API
    await APIRequests.FILE_UPLOAD.record(applicationId, filename, filetype, objectKey)

    // Remove the temporary file
    fs.unlinkSync(filepath)
    debug(`Removed temporary file ${filepath}`)
  } catch (err) {
    console.error(`Cannot write data with key: ${objectKey}`, err)
    boomify(err, { statusCode: 500 })
    throw err
  }
}
