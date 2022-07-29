import Config from './config.js'
import { S3Client, CreateBucketCommand, GetObjectCommand, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3'

export default function () {
  return {
    S3Client: new S3Client({
      ...(Config.aws.s3.endpoint && {
        region: Config.aws.region,
        endpoint: Config.aws.s3.endpoint,
        forcePathStyle: true
      })
    }),
    CreateBucketCommand,
    GetObjectCommand,
    PutObjectCommand,
    ListObjectsCommand
  }
}
