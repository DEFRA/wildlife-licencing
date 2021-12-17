
describe('The powerapps connector', () => {
  beforeEach(() => jest.resetModules())

  it('returns a token', async () => {
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => ({
        getToken: jest.fn(() => ({
          token: 'token',
          expired: jest.fn()
        }))
      }))
    }))
    const { POWERAPPS } = await import('../power-apps.js')
    const token = await POWERAPPS.getToken()
    expect(token.token).toBe('token')
  })

  it('returns a token - if called twice checks expiry', async () => {
    const mockExpired = jest.fn()
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => ({
        getToken: jest.fn(() => ({
          token: 'token',
          expired: mockExpired
        }))
      }))
    }))
    const { POWERAPPS } = await import('../power-apps.js')
    await POWERAPPS.getToken()
    await POWERAPPS.getToken()
    expect(mockExpired).toHaveBeenCalledTimes(1)
  })

  it('throws on error', async () => {
    jest.doMock('simple-oauth2', () => ({
      __esModule: true,
      ClientCredentials: jest.fn(() => { throw new Error() })
    }))
    const { POWERAPPS } = await import('../power-apps.js')
    await expect(async () => await POWERAPPS.getToken()).rejects.toThrowError()
  })
})
