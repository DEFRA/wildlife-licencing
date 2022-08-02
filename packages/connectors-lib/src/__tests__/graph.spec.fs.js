jest.mock('../config.js', () => ({
  graph: {
    client: 'client',
    secret: 'secret',
    tenant: 'tenant'
  }
}))

describe('Graph API', () => {
  beforeEach(() => jest.resetModules())
  it('get a client', async () => {
    const mockTokenCredentialAuthenticationProvider = jest.fn()
    const mockClientSecretCredential = jest.fn()
    const mockInitWithMiddleware = jest.fn()
    jest.doMock('@azure/identity', () => ({
      ClientSecretCredential: mockClientSecretCredential
    }))
    jest.doMock('@microsoft/microsoft-graph-client', () => ({
      Client: {
        initWithMiddleware: mockInitWithMiddleware
      }
    }))
    jest.doMock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js', () => ({
      TokenCredentialAuthenticationProvider: mockTokenCredentialAuthenticationProvider
    }))
    const { GRAPH } = await import('../graph.js')
    expect(GRAPH.getClient()).not.toBeNull()
    expect(mockClientSecretCredential).toHaveBeenCalledWith('tenant', 'client', 'secret')
    expect(mockTokenCredentialAuthenticationProvider).toHaveBeenCalledWith({ }, { scopes: ['https://graph.microsoft.com/.default'] })
    expect(mockInitWithMiddleware).toHaveBeenCalledWith({ authProvider: {}, debugLogging: true })
  })
})
