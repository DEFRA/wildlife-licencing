import { SECRETS } from '../secrets.js'

jest.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    GetSecretValueCommand: jest.fn().mockImplementation(() => { return {} }),
    SecretsManagerClient: jest.fn().mockImplementation(() => { return { send: () => ({ SecretString: 'bar' }) } })
  }
})

describe('Secrets manager', () => {
  it('fetch secrets runs without failure', async () => {
    const s = await SECRETS.getSecret('foo')
    expect(s).toBe('bar')
  })
})
