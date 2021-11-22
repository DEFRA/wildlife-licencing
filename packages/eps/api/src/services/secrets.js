import { AWS } from '@wildlife-licencing/connectors-lib'
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const secrets = {}

const fetchSecrets = async () => {
  const { secretsManagerClient } = AWS()
  const params = {
    SecretId: '/dev/wls/local/postgres-password'
  }

  const command = new GetSecretValueCommand(params)
  const { SecretString } = await secretsManagerClient.send(command)
  secrets.posgresPw = SecretString
}

export { fetchSecrets, secrets }
