
describe('Defra ID', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('../config.js', () => ({
      defraId: {
        serviceId: 'service-id',
        baseUrl: 'https://discovery',
        configPath: 'path',
        secret: 'secret',
        clientId: 'client-id',
        redirectBase: 'https://0.0.0.0',
        policy: 'policy'
      },
      api: { timeout: 100 }
    }))

    jest.doMock('openid-client', () => ({
      Issuer: {
        discover: () => ({
          issuer: 'issuer',
          token_endpoint: 'https://token',
          metadata: {
            jwks_uri: 'https://jwks'
          },
          Client: jest.fn().mockImplementation(() => ({
            authorizationUrl: () => 'https://authorize'
          }))
        })
      }
    }))

    jest.doMock('jose', () => ({
      createRemoteJWKSet: jest.fn(() => 'ket-set'),
      jwtVerify: () => ({ payload: 'payload' }),
      decodeJwt: () => ('decoded')
    }))
  })

  describe('initialise', () => {
    it('sets id info correctly', async () => {
      const { DEFRA_ID } = await import('../defra-id.js')
      await DEFRA_ID.initialise('callback')
      const info = DEFRA_ID.getInfo()
      expect(info).toEqual({
        JWKS: 'ket-set',
        client: { authorizationUrl: expect.any(Function) },
        tokenEndpoint: 'https://token',
        redirectUri: 'https://0.0.0.0/callback'
      })
    })
  })

  describe('getAuthorizationUrl', () => {
    it('get the url', async () => {
      const { DEFRA_ID } = await import('../defra-id.js')
      await DEFRA_ID.initialise('callback')
      const url = DEFRA_ID.getAuthorizationUrl()
      expect(url).toEqual('https://authorize')
    })
  })

  describe('fetchToken', () => {
    it('get a client', async () => {
      jest.doMock('../fetch-helper.js', () => ({
        httpFetch: () => ({ id_token: 'token' })
      }))
      const { DEFRA_ID } = await import('../defra-id.js')
      await DEFRA_ID.initialise('callback')
      const jwt = await DEFRA_ID.fetchToken('code')
      expect(jwt).toEqual('token')
    })
  })

  describe('verifyToken', () => {
    it('get a client', async () => {
      const { DEFRA_ID } = await import('../defra-id.js')
      await DEFRA_ID.initialise('callback')
      const decode = await DEFRA_ID.verifyToken('jwt')
      expect(decode).toEqual('payload')
    })
  })

  describe('decodeToken', () => {
    it('decodes a token', async () => {
      const { DEFRA_ID } = await import('../defra-id.js')
      await DEFRA_ID.initialise('callback')
      const decode = DEFRA_ID.decodeToken('jwt')
      expect(decode).toEqual('decoded')
    })
  })
})
