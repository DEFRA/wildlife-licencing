import Config from './config.js'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

export const AWS = {
  S3: () => ({
    writeFileStream: async (objectKey, fileStream) => {
      // It should not be necessary but to try and solve the token errors reported on TEST
      // move the client into the stream operator and destroy it immediately
      const client = new S3Client({
        ...(Config.aws.s3.endpoint && {
          region: Config.aws.region,
          endpoint: Config.aws.s3.endpoint,
          forcePathStyle: true
        })
      })

      const params = {
        Bucket: Config.aws.s3.bucket,
        ACL: 'authenticated-read',
        Key: objectKey,
        Body: fileStream
      }

      try {
        await client.send(new PutObjectCommand(params))
      } catch (err) {
        console.error('Error writing stream', err)
        throw err
      } finally {
        client.destroy()
      }
    },
    readFileStream: async objectKey => {
      const client = new S3Client({
        ...(Config.aws.s3.endpoint && {
          region: Config.aws.region,
          endpoint: Config.aws.s3.endpoint,
          forcePathStyle: true
        })
      })
      try {
        const response = await client.send(new GetObjectCommand({
          Bucket: Config.aws.s3.bucket,
          Key: objectKey
        }))
        return { stream: response.Body, bytes: response.ContentLength }
      } catch (err) {
        console.error('Error reading stream', err)
        throw err
      }
    }
  }),
  secretsManager: () => {
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
