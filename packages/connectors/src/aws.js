import Config from './config.js'

import { S3 } from '@aws-sdk/client-s3'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export default function () {
  return {
    s3: new S3({
      apiVersion: '2006-03-01',
      ...(Config.aws.s3.endpoint && {
        endpoint: Config.aws.s3.endpoint,
        s3ForcePathStyle: true
      })
    }),
    secretsManagerClient: new SecretsManagerClient({
      apiVersion: '2017-10-17',
      ...(Config.aws.secretsManager.endpoint && {
        endpoint: Config.aws.secretsManager.endpoint
      })
    })
  }
}
