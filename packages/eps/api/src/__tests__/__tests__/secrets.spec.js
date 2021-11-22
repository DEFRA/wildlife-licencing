import { AWS } from '@wildlife-licencing-service/connectors'
import { secrets, fetchSecrets } from '../../services/secrets'

jest.mock('@wildlife-licencing-service/connectors')

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
