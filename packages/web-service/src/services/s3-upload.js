import fs from 'fs'
import { AWS } from '@defra/wls-connectors-lib'
import Boom from '@hapi/boom'
import { v4 as uuidv4 } from 'uuid'
import db from 'debug'
const debug = db('web-service:s3')

const { S3Client, CreateBucketCommand, PutObjectCommand } = AWS()

const createBucket = async bucketName => {
  try {
    await S3Client.send(new CreateBucketCommand({ Bucket: bucketName }))
    debug(`Successfully created a bucket: ${bucketName}`)
  } catch (err) {
    debug(`Found bucket: ${bucketName}`)
  }
}

export const s3FileUpload = async (applicationId, filename, filepath, filetype) => {
  const bucketName = `${applicationId}.${filetype}`
  await createBucket(bucketName)
  const fileReadStream = fs.createReadStream(filepath)

  // The filename will be recorded by the API
  const objectKey = uuidv4()
  const params = {
    Bucket: bucketName,
    ACL: 'authenticated-read',
    Key: objectKey,
    Body: fileReadStream
  }

  try {
    await S3Client.send(new PutObjectCommand(params))
    debug(`Wrote file ${filename} to bucket: ${bucketName} with key: ${objectKey}`)
    // Remove the temporary file
    fs.unlinkSync(filepath)
    debug(`Removed temporary file ${filepath}`)
  } catch (err) {
    console.error(`Cannot write data to s3 bucket: ${bucketName}`, err)
    Boom.boomify(err, { statusCode: 500 })
    throw err
  }
}
