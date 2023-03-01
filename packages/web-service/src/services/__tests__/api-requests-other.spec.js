jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests other service', () => {
  describe('OTHER requests', () => {
    beforeEach(() => jest.resetModules())
    it('reset calls the API correctly', async () => {
      const mockPost = jest.fn().mockReturnValueOnce([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.OTHER.reset('email@email.com')
      expect(mockPost).toHaveBeenCalledWith('/reset', { username: 'email@email.com' })
    })

    it('authorities, calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.OTHER.authorities()
      expect(mockGet).toHaveBeenCalledWith('/authorities')
    })

    it('designated sites, calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.OTHER.designatedSites()
      expect(mockGet).toHaveBeenCalledWith('/designated-sites')
    })
  })
})
