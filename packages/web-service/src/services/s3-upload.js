import fs from 'fs'
import { AWS } from '@defra/wls-connectors-lib'
import { boomify } from '@hapi/boom'
import { v4 as uuidv4 } from 'uuid'
import db from 'debug'
import { APIRequests } from './api-requests.js'
const debug = db('web-service:s3')

const { S3Client, PutObjectCommand, bucket } = AWS()

/**
 * Returns async file upload function
 * @param context
 * @param filename
 * @param filepath
 * @param filetype
 * @returns {(function(*): Promise<void>)|*}
 */
export const s3FileUpload = (context, filename, filepath, filetype) => async id => {
  const fileReadStream = fs.createReadStream(filepath)

  // The filename will be recorded by the API
  const objectKey = uuidv4()
  const params = {
    Bucket: bucket,
    ACL: 'authenticated-read',
    Key: objectKey,
    Body: fileReadStream
  }

  try {
    await S3Client.send(new PutObjectCommand(params))
    debug(`Wrote file ${filename} with key: ${objectKey}`)

    // Record the file upload on the API
    await APIRequests.FILE_UPLOAD[context].record(id, filename, filetype, objectKey)

    // Remove the temporary file
    fs.unlinkSync(filepath)
    debug(`Removed temporary file ${filepath}`)
  } catch (err) {
    console.error(`Cannot write data with key: ${objectKey} to bucket: ${bucket}`, err)
    boomify(err, { statusCode: 500 })
    throw err
  } finally {
    S3Client.destroy()
  }
}
