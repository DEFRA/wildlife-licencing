jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests designated sites service', () => {
  beforeEach(() => jest.resetModules())

  it('getDesignatedSites calls the API connector correctly', async () => {
    const mockGet = jest.fn(() => ({ designatedSiteId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      API: {
        get: mockGet
      }
    }))
    const { APIRequests } = await import('../api-requests.js')
    await APIRequests.DESIGNATED_SITES.getDesignatedSites()
    expect(mockGet).toHaveBeenCalledWith('designated-sites')
  })

  it('get calls the API connector correctly', async () => {
    const mockGet = jest.fn(() => ({ designatedSiteId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      API: {
        get: mockGet
      }
    }))
    const { APIRequests } = await import('../api-requests.js')
    await APIRequests.DESIGNATED_SITES.get('9d62e5b8-9c77-ec11-8d21-000d3a87431b')
    expect(mockGet).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/designated-sites')
  })

  it('create calls the API connector correctly', async () => {
    const mockPost = jest.fn(() => ({ id: 'applicationId' }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      API: {
        post: mockPost
      }
    }))
    const { APIRequests } = await import('../api-requests.js')
    await APIRequests.DESIGNATED_SITES.create('9d62e5b8-9c77-ec11-8d21-000d3a87431b', { designatedSiteId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
    expect(mockPost).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/designated-site', { designatedSiteId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
  })

  it('update calls the API connector correctly', async () => {
    const mockPut = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      API: {
        put: mockPut
      }
    }))
    const { APIRequests } = await import('../api-requests.js')
    await APIRequests.DESIGNATED_SITES.update('9d62e5b8-9c77-ec11-8d21-000d3a87431b', '1c3e7655-bb74-4420-9bf0-0bd710987f10', { designatedSiteId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
    expect(mockPut).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/designated-site/1c3e7655-bb74-4420-9bf0-0bd710987f10', { designatedSiteId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
  })

  it('destroy calls the API connector correctly', async () => {
    const mockDelete = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      API: {
        delete: mockDelete
      }
    }))
    const { APIRequests } = await import('../api-requests.js')
    await APIRequests.DESIGNATED_SITES.destroy('9d62e5b8-9c77-ec11-8d21-000d3a87431b', '1c3e7655-bb74-4420-9bf0-0bd710987f10')
    expect(mockDelete).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/designated-site/1c3e7655-bb74-4420-9bf0-0bd710987f10')
  })
})
