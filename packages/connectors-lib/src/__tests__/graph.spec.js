jest.mock('../config.js', () => ({
  powerApps: {
    oauth: {
      client: {
        id: 'client',
        secret: 'secret'

      }
    }
  },
  graph: {
    tenant: 'tenant',
    siteId: 'siteId',
    driverId: 'driveId'
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
    expect(GRAPH.client()).not.toBeNull()
    expect(mockClientSecretCredential).toHaveBeenCalledWith('tenant', 'client', 'secret')
    expect(mockTokenCredentialAuthenticationProvider).toHaveBeenCalledWith({ }, { scopes: ['https://graph.microsoft.com/.default'] })
    expect(mockInitWithMiddleware).toHaveBeenCalledWith({ authProvider: {}, debugLogging: true })
  })

  it('upload a file calls the GRAPH API correctly', async () => {
    const mockTokenCredentialAuthenticationProvider = jest.fn()
    const mockClientSecretCredential = jest.fn()
    const mockClient = { foo: 'bar' }
    const mockCreateUploadSession = jest.fn()
    const mockInitWithMiddleware = jest.fn(() => mockClient)
    const mockUpload = jest.fn()
    const mockStreamUploadConstructor = jest.fn()
    jest.doMock('@azure/identity', () => ({
      ClientSecretCredential: mockClientSecretCredential
    }))

    function LargeFileUploadTask () {
      this.upload = mockUpload
    }

    LargeFileUploadTask.createUploadSession = mockCreateUploadSession

    jest.doMock('@microsoft/microsoft-graph-client', () => ({
      Client: {
        initWithMiddleware: mockInitWithMiddleware
      },
      LargeFileUploadTask: LargeFileUploadTask,
      StreamUpload: mockStreamUploadConstructor
    }))
    jest.doMock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js', () => ({
      TokenCredentialAuthenticationProvider: mockTokenCredentialAuthenticationProvider
    }))
    const { GRAPH } = await import('../graph.js')
    await GRAPH.client().uploadFile('filename', 100, {}, 'path')
    expect(mockCreateUploadSession).toHaveBeenCalledWith({ foo: 'bar' },
      'https://graph.microsoft.com/v1.0/sites/siteId/drives/undefined/root:path/filename:/createUploadSession',
      { item: { '@microsoft.graph.conflictBehavior': 'rename' } }
    )
    expect(mockUpload).toHaveBeenCalled()
  })

  it('upload a file - an exception in the GRAPH API is propagated', async () => {
    const mockTokenCredentialAuthenticationProvider = jest.fn()
    const mockClientSecretCredential = jest.fn()
    const mockClient = { foo: 'bar' }
    const mockCreateUploadSession = jest.fn(() => { throw new Error() })
    const mockInitWithMiddleware = jest.fn(() => mockClient)
    const mockUpload = jest.fn()
    const mockStreamUploadConstructor = jest.fn()
    jest.doMock('@azure/identity', () => ({
      ClientSecretCredential: mockClientSecretCredential
    }))

    function LargeFileUploadTask () {
      this.upload = mockUpload
    }

    LargeFileUploadTask.createUploadSession = mockCreateUploadSession

    jest.doMock('@microsoft/microsoft-graph-client', () => ({
      Client: {
        initWithMiddleware: mockInitWithMiddleware
      },
      LargeFileUploadTask: LargeFileUploadTask,
      StreamUpload: mockStreamUploadConstructor
    }))
    jest.doMock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js', () => ({
      TokenCredentialAuthenticationProvider: mockTokenCredentialAuthenticationProvider
    }))
    const { GRAPH } = await import('../graph.js')
    await expect(() => GRAPH.client().uploadFile('filename', 100, {}, 'path'))
      .rejects.toThrow()
  })
})
