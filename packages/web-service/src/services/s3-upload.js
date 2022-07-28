import { S3 } from '@aws-sdk/client-s3'
import fs from 'fs'
import Boom from '@hapi/boom'
const accountID = '-------'
const region = 'eu-west-2'

export async function s3FileUpload (applicationName, fileName, path) {
  const s3inst = new S3({
    region: region,
    credentials: {
      accessKeyId: '-----',
      secretAccessKey: '-----'
    }
  })
  s3inst.headBucket({ Bucket: applicationName, ExpectedBucketOwner: accountID }, async err => {
    if (err) {
      s3inst.createBucket({ Bucket: applicationName }, async createErr => {
        if (createErr) {
          console.error('Message', createErr)
          Boom.boomify(createErr, { statusCode: 500 })
          throw createErr
        }
        const file = fs.readFileSync(path)
        await s3inst.putObject({
          ACL: 'bucket-owner-full-control',
          Body: file,
          Bucket: applicationName,
          Key: fileName
        })
        return true
      })
    }
    const addFile = fs.readFileSync(path)
    await s3inst.putObject({
      ACL: 'bucket-owner-full-control',
      Body: addFile,
      Bucket: applicationName,
      Key: fileName
    })
    return true
  })
}
