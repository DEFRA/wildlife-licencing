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

    it('create rethrows on error', async () => {
      const mockPost = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.SITE.create('668ee1f0-073d-480c-a802-59db362897e6', { name: 'site' }))
        .rejects.toThrow()
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

    it('findByApplicationId rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.SITE.findByApplicationId('668ee1f0-073d-480c-a802-59db362897e6'))
        .rejects.toThrow()
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

    it('update rethrows on error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.SITE.update('668ee1f0-073d-480c-a802-59db362897e6', { foo: 'bar' }))
        .rejects.toThrow()
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

    it('destroy rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.SITE.destroy('668ee1f0-073d-480c-a802-59db362897e6', '6e48a6f4-5a27-475d-bd83-561c6e0e80d2'))
        .rejects.toThrow()
    })
  })
})