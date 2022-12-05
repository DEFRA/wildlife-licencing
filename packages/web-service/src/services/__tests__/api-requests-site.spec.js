jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests site service', () => {
  describe('SITE requests', () => {
    beforeEach(() => jest.resetModules())

    it('create calls the API correctly', async () => {
      const mockPost = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.create('668ee1f0-073d-480c-a802-59db362897e6', { name: 'site' })
      expect(mockPost).toHaveBeenCalledWith('/site', { name: 'site' })
      expect(mockPost).toHaveBeenCalledWith('/application-site', { applicationId: '668ee1f0-073d-480c-a802-59db362897e6', siteId: 1 })
    })

    it('findByApplicationId calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([{ siteId: 1 }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.findByApplicationId('668ee1f0-073d-480c-a802-59db362897e6')
      expect(mockGet).toHaveBeenCalledWith('/application-sites', 'applicationId=668ee1f0-073d-480c-a802-59db362897e6')
      expect(mockGet).toHaveBeenCalledWith('/site/1')
    })

    it('getSiteById calls the API connector correctly', async () => {
      const mockGet = jest.fn(() => ({ siteId: 123456789 }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.SITE.getSiteById('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(mockGet).toHaveBeenCalledWith('/site/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(result).toEqual({ siteId: 123456789 })
    })

    it('getApplicationSitesByUserId calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([{ name: 'Site 2' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.getApplicationSitesByUserId('668ee1f0-073d-480c-a802-59db362897e6')
      expect(mockGet).toHaveBeenCalledWith('/application-sites/sites', 'userId=668ee1f0-073d-480c-a802-59db362897e6')
    })

    it('update calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.update('668ee1f0-073d-480c-a802-59db362897e6', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/site/668ee1f0-073d-480c-a802-59db362897e6', { foo: 'bar' })
    })

    it('destroy calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValue([{ id: 1 }])
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.destroy('668ee1f0-073d-480c-a802-59db362897e6', '6e48a6f4-5a27-475d-bd83-561c6e0e80d2')
      expect(mockDelete).toHaveBeenCalledWith('/application-site/1')
      expect(mockDelete).toHaveBeenCalledWith('/site/6e48a6f4-5a27-475d-bd83-561c6e0e80d2')
    })
  })
})
