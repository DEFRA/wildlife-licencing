jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the check your answers functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    beforeEach(() => jest.resetModules())

    it(' should return the return data and the uploaded files of the return', async () => {
      const mockGetUploadedFiles = jest.fn(() => ([{ id: '8179c2f2-6eec-43d6-899b-6504d6a1e798', createdAt: '2022-03-25T14:10:14.861Z', updatedAt: '2022-03-25T14:10:14.861Z', filetype: 'METHOD-STATEMENT', applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }]))
      const mockGetData = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', returns: { id: '7654398', licenceId: '12345' } }))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: ({
          LICENCES: {
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567',
              endDate: '2022-08-26',
              startDate: '2022-08-10'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              nilReturn: false,
              completedWithinLicenceDates: true,
              outcome: false,
              obstructionBlockingOrProofing: true,
              obstructionBlockingOrProofingDetails: 'carried out'
            }))
          },
          FILE_UPLOAD: {
            RETURN: {
              getUploadedFiles: mockGetUploadedFiles
            }
          }
        })
      }))

      const request = {
        cache: () => ({
          getData: mockGetData
        })
      }
      const { getData } = await import('../returns-check.js')
      const result = await getData(request)
      expect(mockGetData).toHaveBeenCalled()
      expect(mockGetUploadedFiles).toHaveBeenCalledWith('7654398')
      expect(result).toEqual({
        nilReturn: false,
        completedWithinLicenceDates: true,
        destroyDate: null,
        outcome: false,
        whyNil: undefined,
        obstructionBlockingOrProofing: true,
        obstructionBlockingOrProofingDetails: 'carried out',
        endDate: null,
        startDate: null,
        licenceEndDate: '26 August 2022',
        licenceStartDate: '10 August 2022',
        noArtificialSettReason: undefined,
        uploadedFiles: [
          {
            applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e',
            id: '8179c2f2-6eec-43d6-899b-6504d6a1e798',
            filetype: 'METHOD-STATEMENT',
            updatedAt: '2022-03-25T14:10:14.861Z',
            createdAt: '2022-03-25T14:10:14.861Z',
            uploadedDate: '25 March 2022'
          }
        ]
      })
    })
  })
})
