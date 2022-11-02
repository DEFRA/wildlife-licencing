
jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests licence service', () => {
  describe('LICENCE requests', () => {
    beforeEach(() => jest.resetModules())

    it('findByApplicationId calls the API connector correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.LICENCES.findByApplicationId('9d62e5b8-9c77-ec11-8d21-000d3a87431b')
      expect(mockGet).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/licences')
    })

    it('findByApplicationId rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.LICENCES.findByApplicationId('9d62e5b8-9c77-ec11-8d21-000d3a87431b'))
        .rejects.toThrowError()
    })
  })
})