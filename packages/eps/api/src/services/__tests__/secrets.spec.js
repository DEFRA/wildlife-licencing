import { AWS } from '@defra/wls-connectors-lib'
import { secrets, fetchSecrets } from '../secrets'

jest.mock('@defra/wls-connectors-lib')

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
