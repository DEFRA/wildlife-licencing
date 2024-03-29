jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the check-supporting-information page handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
  })

  describe('the getData function', () => {
    it(' should return the supporting information uploaded file', async () => {
      const mockRemoveUploadedFile = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', uploadId: '1234567' }))
      const mockGetUploadedFiles = jest.fn(() => ([{ id: '8179c2f2-6eec-43d6-899b-6504d6a1e798', createdAt: '2022-03-25T14:10:14.861Z', updatedAt: '2022-03-25T14:10:14.861Z', filetype: 'METHOD-STATEMENT', applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }]))
      const mockGetData = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', returns: { id: '7654398' } }))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: ({
          FILE_UPLOAD: {
            RETURN: {
              removeUploadedFile: mockRemoveUploadedFile,
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
      const { getData } = await import('../returns-uploaded-files.js')
      const result = await getData(request)
      expect(mockGetData).toHaveBeenCalled()
      expect(mockGetUploadedFiles).toHaveBeenCalledWith('7654398')
      expect(result).toEqual([{
        applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e',
        id: '8179c2f2-6eec-43d6-899b-6504d6a1e798',
        removeUploadUrl: '/remove-returns-uploaded-file',
        filetype: 'METHOD-STATEMENT',
        updatedAt: '2022-03-25T14:10:14.861Z',
        createdAt: '2022-03-25T14:10:14.861Z',
        uploadedDate: '25 March 2022'
      }]
      )
    })

    it(' should return undefined when no uploaded supporting information file found ', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: ({
          FILE_UPLOAD: {
            RETURN: {
              removeUploadedFile: jest.fn(),
              getUploadedFiles: jest.fn(() => null)
            }
          }
        })
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))
        })
      }
      const { getData } = await import('../returns-uploaded-files.js')
      const result = await getData(request)
      expect(result).toBeUndefined()
    })
  })

  describe('the setData function', () => {
    it('updates the uploadAnotherFile flag', async () => {
      const mockSetData = jest.fn()
      const licenceId = 'ABC-567-GHU'
      const returnId = '123456789'
      const request = {
        payload: {
          'another-file-check': 'yes'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId,
            returns: {
              id: returnId
            }
          }),
          setData: mockSetData
        })
      }

      const mockUpdateLicenceReturn = jest.fn()
      const mockLicenceReturnData = {
        nilReturn: false
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturn: jest.fn(() => mockLicenceReturnData),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../returns-uploaded-files.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith(licenceId, returnId, { ...mockLicenceReturnData, uploadAnotherFile: true })
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the validator function', () => {
    it('should display a validation error if the user does not input a choice for another file upload', async () => {
      try {
        const payload = {}
        const { validator } = await import('../returns-uploaded-files.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: Option for another file upload has not been chosen')
      }
    })

    it('should not display an error if the user input a choice for another file upload', async () => {
      const payload = {
        'another-file-check': 'no'
      }
      const { validator } = await import('../returns-uploaded-files.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
