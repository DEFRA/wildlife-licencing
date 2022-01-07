import { Readable } from 'stream'

describe('The powerapps connector', () => {
  beforeEach(() => jest.resetModules())

  it('returns a token', async () => {
    jest.doMock('node-fetch')
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => ({
        getToken: jest.fn(() => ({
          token: { token_type: 'Bearer', access_token: '56GKJGKJHGS' },
          expired: jest.fn()
        }))
      }))
    }))

    const { getToken } = await import('../power-apps.js')
    const token = await getToken()
    expect(token).toBe('Bearer 56GKJGKJHGS')
  })

  it('returns a token - if called twice checks expiry', async () => {
    const mockExpired = jest.fn()
    jest.doMock('node-fetch')
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => ({
        getToken: jest.fn(() => ({
          token: { token_type: 'Bearer', access_token: '56GKJGKJHGS' },
          expired: mockExpired
        }))
      }))
    }))
    const { getToken } = await import('../power-apps.js')
    await getToken()
    await getToken()
    expect(mockExpired).toHaveBeenCalledTimes(1)
  })

  it('token acquisition throws on error', async () => {
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => { throw new Error() })
    }))
    const { getToken } = await import('../power-apps.js')
    await expect(async () => await getToken()).rejects.toThrowError()
  })

  it('batch request success case returns 200', async () => {
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => ({
        getToken: jest.fn(() => ({
          token: { token_type: 'Bearer', access_token: '56GKJGKJHGS' },
          expired: jest.fn()
        }))
      }))
    }))

    jest.doMock('../config.js', () => ({
      powerApps: {
        client: {
          url: 'http://powerapps:8080'
        }
      }
    }))

    async function * generate () {
      yield 'data-'
      yield 'data-'
      yield 'data'
    }

    const mockFetch = jest.fn(() => ({ ok: true, body: Readable.from(generate()) }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))

    const { POWERAPPS } = await import('../power-apps.js')
    const response = await POWERAPPS.batchRequest('batch123', 'batch-payload')
    expect(response).toBe('data-data-data')
    expect(mockFetch).toHaveBeenCalledWith('http://powerapps:8080/$batch', {
      body: 'batch-payload',
      method: 'POST',
      headers: {
        Authorization: 'Bearer 56GKJGKJHGS',
        'Content-Type': 'multipart/mixed;boundary=batch_batch123',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Prefer: 'return=representation'
      },
      signal: expect.any(Object)
    })
  })

  it('batch request failure case returns 400', async () => {
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => ({
        getToken: jest.fn(() => ({
          token: { token_type: 'Bearer', access_token: '56GKJGKJHGS' },
          expired: jest.fn()
        }))
      }))
    }))

    jest.doMock('../config.js', () => ({
      powerApps: {
        client: {
          url: 'http://powerapps:8080'
        }
      }
    }))

    const mockFetch = jest.fn(() => ({ ok: false, status: 400 }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { POWERAPPS, HTTPResponseError } = await import('../power-apps.js')

    await expect(async () =>
      await POWERAPPS.batchRequest('batch123', 'batch-payload'))
      .rejects.toThrowError(HTTPResponseError)
  })

  it('batch request failure case fetch throws Error', async () => {
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => ({
        getToken: jest.fn(() => ({
          token: { token_type: 'Bearer', access_token: '56GKJGKJHGS' },
          expired: jest.fn()
        }))
      }))
    }))

    jest.doMock('../config.js', () => ({
      powerApps: {
        client: {
          url: 'http://powerapps:8080'
        }
      }
    }))

    const mockFetch = jest.fn(() => { throw new Error() })
    jest.doMock('node-fetch', () => mockFetch)
    const { POWERAPPS } = await import('../power-apps.js')

    await expect(async () =>
      await POWERAPPS.batchRequest('batch123', 'batch-payload'))
      .rejects.toThrowError(Error)
  })

  it('batch request failure case fetch throws AbortError', async () => {
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => ({
        getToken: jest.fn(() => ({
          token: { token_type: 'Bearer', access_token: '56GKJGKJHGS' },
          expired: jest.fn()
        }))
      }))
    }))

    jest.doMock('../config.js', () => ({
      powerApps: {
        client: {
          url: 'http://powerapps:8080'
        }
      }
    }))

    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const AbortError = new Error()
    AbortError.name = 'AbortError'
    const mockFetch = jest.fn(() => { throw AbortError })
    const { POWERAPPS } = await import('../power-apps.js')
    await expect(async () =>
      await POWERAPPS.batchRequest('batch123', 'batch-payload'))
      .rejects.toThrowError(Error)
  })

  it('provides the configured target url', async () => {
    jest.doMock('../config.js', () => ({
      powerApps: {
        client: {
          url: 'http://powerapps:8080/xyz'
        }
      }
    }))
    jest.doMock('node-fetch')
    const { POWERAPPS } = await import('../power-apps.js')
    expect(POWERAPPS.getClientUrl()).toBe('http://powerapps:8080/xyz')
  })
})
