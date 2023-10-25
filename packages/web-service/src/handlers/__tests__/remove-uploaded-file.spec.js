
describe('the remove-uploaded-file handler function', () => {
  beforeEach(() => jest.resetModules())

  it('should not call remove upload file when there is no uploadId', async () => {
    const mockRemoveUploadedFile = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', uploadId: '1234567' }))
    const mockRedirect = jest.fn()
    const mockGetData = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))
    const request = {
      query: {},
      cache: () => ({
        getData: mockGetData
      })
    }

    const h = {
      redirect: mockRedirect
    }

    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        FILE_UPLOAD: {
          removeUploadedFile: mockRemoveUploadedFile
        }
      }
    }))
    const removeUploadFile = (await import('../remove-uploaded-file.js')).default
    await removeUploadFile(request, h)
    expect(mockRemoveUploadedFile).not.toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/check-supporting-information')
  })

  it('should handle correctly the API and redirect to the check-supporting-information', async () => {
    const mockRemoveUploadedFile = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', uploadId: '1234567' }))
    const mockRedirect = jest.fn()
    const mockGetData = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))
    const request = {
      query: {
        uploadId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
      },
      cache: () => ({
        getData: mockGetData
      })
    }

    const h = {
      redirect: mockRedirect
    }

    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        FILE_UPLOAD: {
          APPLICATION: {
            removeUploadedFile: mockRemoveUploadedFile
          }
        }
      }
    }))
    const removeUploadFile = (await import('../remove-uploaded-file.js')).default
    await removeUploadFile(request, h)
    expect(mockRemoveUploadedFile).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/check-supporting-information')
  })
})
