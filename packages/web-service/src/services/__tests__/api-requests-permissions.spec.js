jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests permission service', () => {
  describe('permission requests', () => {
    beforeEach(() => jest.resetModules())

    it('create calls the API correctly', async () => {
      const mockPost = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.PERMISSION.createPermission('668ee1f0-073d-480c-a802-59db362897e6', { type: '410023' })
      expect(mockPost).toHaveBeenCalledWith('/application/668ee1f0-073d-480c-a802-59db362897e6/permission', { type: '410023' })
    })

    it('getPermissionDetailsById calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([{ id: 1 }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.PERMISSION.getPermissionDetailsById('668ee1f0-073d-480c-a802-59db362897e6')
      expect(mockGet).toHaveBeenCalledWith('/application/668ee1f0-073d-480c-a802-59db362897e6/permissions-section')
    })

    it('update calls the permission section API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.PERMISSION.updatePermissionsSection('668ee1f0-073d-480c-a802-59db362897e6', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application/668ee1f0-073d-480c-a802-59db362897e6/permissions-section', { foo: 'bar' })
    })

    it('getPermissions calls the API connector correctly', async () => {
      const mockGet = jest.fn(() => ({ planningType: '123456789' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.PERMISSION.getPermissions('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(mockGet).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/permissions')
      expect(result).toEqual({ planningType: '123456789' })
    })

    it('getPermission calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([{}])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.PERMISSION.getPermission('668ee1f0-073d-480c-a802-59db362897e6', '12345678')
      expect(mockGet).toHaveBeenCalledWith('/application/668ee1f0-073d-480c-a802-59db362897e6/permission/12345678')
    })

    it('removePermission calls the API correctly', async () => {
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.PERMISSION.removePermission('668ee1f0-073d-480c-a802-59db362897e6', '6e48a6f4-5a27-475d-bd83-561c6e0e80d2')
      expect(mockDelete).toHaveBeenCalledWith('/application/668ee1f0-073d-480c-a802-59db362897e6/permission/6e48a6f4-5a27-475d-bd83-561c6e0e80d2')
    })

    it('update calls the permission API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.PERMISSION.updatePermission('668ee1f0-073d-480c-a802-59db362897e6', '6e48a6f4-5a27-475d-bd83-561c6e0e80d2', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application/668ee1f0-073d-480c-a802-59db362897e6/permission/6e48a6f4-5a27-475d-bd83-561c6e0e80d2', { foo: 'bar' })
    })

    it('removePermissionDetails calls the API correctly', async () => {
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.PERMISSION.removePermissionDetails('668ee1f0-073d-480c-a802-59db362897e6')
      expect(mockDelete).toHaveBeenCalledWith('/application/668ee1f0-073d-480c-a802-59db362897e6/permissions-section')
    })
  })
})
