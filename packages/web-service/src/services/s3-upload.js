import { S3 } from '@aws-sdk/client-s3'
import fs from 'fs'
const accountID = '514125100797'
const region = 'eu-west-2'

export async function S3FileUpload (applicationName, fileName, file) {
  const s3inst = new S3({
    region: region,
    credentials: {
      secretAccessKey: '0fSeWQAZAi0KeIhydPWEpwZcihCV09nfp5/gx/ly',
      accessKeyId: 'AKIAXPNB6O366AJDMFPQ'
    }
  })
  s3inst.headBucket({ Bucket: applicationName, ExpectedBucketOwner: accountID }, async (err) => {
    if (err) {
      s3inst.createBucket({ Bucket: applicationName }, async (createErr) => {
        if (createErr) {
          console.error(createErr)
          return false
        } else {
          const file2go = fs.readFileSync(file)
          await s3inst.putObject({
            ACL: 'bucket-owner-full-control',
            Body: file2go,
            Bucket: applicationName,
            Key: fileName
          })
          return true
        }
      })
    } else {
      const file2go = fs.readFileSync(file)
      await s3inst.putObject({
        ACL: 'bucket-owner-full-control',
        Body: file2go,
        Bucket: applicationName,
        Key: fileName
      })
      return true
    }
  })
  return false
}
