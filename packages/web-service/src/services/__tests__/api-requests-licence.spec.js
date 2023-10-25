
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

    it('findActiveLicencesByApplicationId calls findByApplicationId and then returns only licences with stateCode 0', async () => {
      const { APIRequests } = await import('../api-requests.js')

      APIRequests.LICENCES.findByApplicationId = jest.fn(() => ([
        { id: '1', name: 'Licence 1', stateCode: 1 },
        { id: '2', name: 'Licence 2', stateCode: 1 },
        { id: '3', name: 'Licence 3', stateCode: 0 }
      ]))

      const applicationId = '9d62e5b8-9c77-ec11-8d21-000d3a87431b'

      const licencesReturned = await APIRequests.LICENCES.findActiveLicencesByApplicationId(applicationId)
      expect(APIRequests.LICENCES.findByApplicationId).toHaveBeenCalledWith(applicationId)
      // Only the licence with stateCode 0 should be returned
      expect(licencesReturned).toEqual([
        { id: '3', name: 'Licence 3', stateCode: 0 }
      ])
    })

    it('queueTheLicenceEmailResend calls the API connector correctly', async () => {
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.LICENCES.queueTheLicenceEmailResend('9d62e5b8-9c77-ec11-8d21-000d3a87431b')
      expect(mockPost).toHaveBeenCalledWith('/application/licence/resend/9d62e5b8-9c77-ec11-8d21-000d3a87431b/submit')
    })
  })
})
