import { AWS } from '@wildlife-licencing-service/connectors-lib/src/connectors'
import { secrets, fetchSecrets } from '../secrets'

jest.mock('@wildlife-licencing-service/connectors-lib')

describe('Secrets manager', () => {
  const pw = 'foo'
  it('fetch secrets runs without failure', async () => {
    AWS.mockImplementation(() => ({
      secretsManagerClient: {
        send: () => ({ SecretString: pw })
      }
    }))

    await fetchSecrets()
    expect(secrets.posgresPw).toBe(pw)
  })
})
