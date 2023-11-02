jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests return service', () => {
  describe('return requests', () => {
    beforeEach(() => jest.resetModules())

    it('createLicenceReturn calls the API correctly', async () => {
      const mockPost = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.RETURNS.createLicenceReturn('668ee1f0-073d-480c-a802-59db362897e6', { nilReturn: true })
      expect(mockPost).toHaveBeenCalledWith('/licence/668ee1f0-073d-480c-a802-59db362897e6/return', { nilReturn: true })
    })

    it('updateLicenceReturn calls the API correctly', async () => {
      const mockUpdate = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockUpdate
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.RETURNS.updateLicenceReturn('668ee1f0-073d', '480c-a802-59db362897e6', { nilReturn: true })
      expect(mockUpdate).toHaveBeenCalledWith('/licence/668ee1f0-073d/return/480c-a802-59db362897e6', { nilReturn: true })
    })

    it('getLicenceReturns calls the API correctly', async () => {
      const mockGetLicenceReturns = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGetLicenceReturns
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.RETURNS.getLicenceReturns('668ee1f0-073d')
      expect(mockGetLicenceReturns).toHaveBeenCalledWith('/licence/668ee1f0-073d/returns')
    })

    it('getLastLicenceReturn calls the API correctly', async () => {
      const mockGetLicenceReturns = jest.fn().mockReturnValueOnce([{ id: 1 }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGetLicenceReturns
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.RETURNS.getLastLicenceReturn('668ee1f0-073d')
      expect(mockGetLicenceReturns).toHaveBeenCalledWith('/licence/668ee1f0-073d/returns')
    })

    it('getLastLicenceReturn returns null if api returns an empty array', async () => {
      const mockGetLicenceReturns = jest.fn().mockReturnValueOnce([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGetLicenceReturns
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const licenceReturn = await APIRequests.RETURNS.getLastLicenceReturn('668ee1f0-073d')
      expect(licenceReturn).toBe(null)
    })

    it('getLicenceReturn calls the API correctly', async () => {
      const mockGetLicenceReturn = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGetLicenceReturn
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.RETURNS.getLicenceReturn('668ee1f0', '480c-a802')
      expect(mockGetLicenceReturn).toHaveBeenCalledWith('/licence/668ee1f0/return/480c-a802')
    })

    it('getLicenceActions calls the API correctly', async () => {
      const mockGetLicenceActions = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGetLicenceActions
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.RETURNS.getLicenceActions('480c-a802')
      expect(mockGetLicenceActions).toHaveBeenCalledWith('/licence/480c-a802/habitat-sites')
    })

    it('queueReturnForSubmission calls the API correctly', async () => {
      const mockPostLicenceActions = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPostLicenceActions
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.RETURNS.queueReturnForSubmission('668ee1f0', '480c-a802')
      expect(mockPostLicenceActions).toHaveBeenCalledWith('/licence/668ee1f0/return/480c-a802/submit')
    })
  })
})
