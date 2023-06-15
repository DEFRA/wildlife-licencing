import Config from './config.js'
import { S3Client, CreateBucketCommand, GetObjectCommand, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

export default function () {
  return {
    S3: {
      S3Client: new S3Client({
        ...(Config.aws.s3.endpoint && {
          region: Config.aws.region,
          endpoint: Config.aws.s3.endpoint,
          forcePathStyle: true
        })
      }),
      bucket: Config.aws.s3.bucket,
      CreateBucketCommand,
      GetObjectCommand,
      PutObjectCommand,
      ListObjectsCommand
    },
    SecretsManager: () => {
      const client = new SecretsManagerClient({
        ...(Config.aws.secretsManager.endpoint && {
          endpoint: Config.aws.secretsManager.endpoint
        })
      })
      return {
        getSecret: async name => {
          try {
            const { SecretString } = await client.send(
              new GetSecretValueCommand({
                SecretId: name
              })
            )
            return SecretString
          } catch (error) {
            console.error('Cannot fetch secret: ', error)
            throw error
          }
        }
      }
    }
  }
}
