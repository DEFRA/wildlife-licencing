jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests ecologist experience service', () => {
  describe('ECOLOGIST_EXPERIENCE requests', () => {
    beforeEach(() => jest.resetModules())

    it('getExperienceById calls the API correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById('35acb529-70bb-4b8d-8688-ccdec837e5d4')
      expect(mockGet).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/ecologist-experience')
    })

    it('getExperienceById rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() =>
        APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById('35acb529-70bb-4b8d-8688-ccdec837e5d4'))
        .rejects.toThrowError()
    })

    it('putExperienceById calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById('35acb529-70bb-4b8d-8688-ccdec837e5d4', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/ecologist-experience', { foo: 'bar' })
    })

    it('putExperienceById rethrows on error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() =>
        APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById('35acb529-70bb-4b8d-8688-ccdec837e5d4'))
        .rejects.toThrowError()
    })

    it('getPreviousLicences calls the API correctly', async () => {
      const mockGet = jest.fn(() => [{ licenceNumber: 'ABBB' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences('35acb529-70bb-4b8d-8688-ccdec837e5d4')
      expect(mockGet).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/previous-licences')
      expect(result).toEqual(['ABBB'])
    })

    it('getPreviousLicences rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences('35acb529-70bb-4b8d-8688-ccdec837e5d4'))
        .rejects.toThrowError()
    })

    it('addPreviousLicence calls the API correctly', async () => {
      const mockPost = jest.fn(() => [{ licenceNumber: 'ABBB' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.addPreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'ABBBC')
      expect(mockPost).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/previous-licence', { licenceNumber: 'ABBBC' })
    })

    it('addPreviousLicence rethrows on error', async () => {
      const mockPost = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_EXPERIENCE.addPreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'ABBBC'))
        .rejects.toThrowError()
    })

    it('removePreviousLicence calls the API correctly', async () => {
      const mockGet = jest.fn(() => [{ id: '35acb529-70bb-4b8d-8688-ccdec837e5d4', licenceNumber: 'ABBBC' }])
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.removePreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'ABBBC')
      expect(mockDelete).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/previous-licence/35acb529-70bb-4b8d-8688-ccdec837e5d4')
    })

    it('removePreviousLicence doesnt call the API if no licence found', async () => {
      const mockGet = jest.fn(() => [{ id: '35acb529-70bb-4b8d-8688-ccdec837e5d4', licenceNumber: 'ABBBC' }])
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.removePreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'not-the-same')
      expect(mockDelete).toHaveBeenCalledTimes(0)
    })

    it('removePreviousLicence rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_EXPERIENCE.removePreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'ABBBC'))
        .rejects.toThrowError()
    })
  })
})
