import AWS from './aws.js'
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
const { secretsManagerClient } = AWS()
const secrets = {}

const fetch = async s => {
  const command = new GetSecretValueCommand({ SecretId: s })
  const { SecretString } = await secretsManagerClient.send(command)
  secrets[s] = SecretString
  return SecretString
}

export const SECRETS = {
  /**
   * Fetch a secret once
   * @param s
   * @returns {Promise<string|undefined>}
   */
  getSecret: async s => secrets[s] || fetch(s)
}
