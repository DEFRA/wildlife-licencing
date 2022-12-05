
jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests habitats service', () => {
  describe('HABITAT requests', () => {
    beforeEach(() => jest.resetModules())

    it('create calls the API connector correctly', async () => {
      const mockPost = jest.fn(() => ({ id: 'applicationId' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.create('9d62e5b8-9c77-ec11-8d21-000d3a87431b', { speciesId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
      expect(mockPost).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-site', { speciesId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
    })

    it('create calls the API connector correctly', async () => {
      const payload = { name: 'Corner of field' }
      const mockPost = jest.fn(() => ({ id: 'applicationId' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.create('9d62e5b8-9c77-ec11-8d21-000d3a87431b', payload)
      expect(mockPost).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-site', { name: 'Corner of field' })
    })

    it('retrieves habitats by ID', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.getHabitatsById('9d62e5b8-9c77-ec11-8d21-000d3a87431b')
      expect(mockGet).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-sites')
    })

    it('retrieves habitats by ID', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.putHabitatById('9d62e5b8-9c77-ec11-8d21-000d3a87431b', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', {})
      expect(mockPut).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-site/f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', {})
    })

    it('deletes a habitat by ID', async () => {
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.deleteSett('9d62e5b8-9c77-ec11-8d21-000d3a87431b', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      expect(mockDelete).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-site/f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
    })
  })
})
