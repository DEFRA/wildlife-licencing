
describe('the remove-uploaded-file handler function', () => {
  beforeEach(() => jest.resetModules())

  it('should handle correctly the API and redirect to the upload-supporting-information', async () => {
    const mockRemoveUploadedFile = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', uploadId: '1234567' }))
    const mockGetUploadedFiles = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))
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
        APPLICATION: {
          tags: () => {
            return {
              remove: () => false
            }
          }
        },
        FILE_UPLOAD: {
          removeUploadedFile: mockRemoveUploadedFile,
          getUploadedFiles: mockGetUploadedFiles
        }
      }
    }))
    const removeUploadFile = (await import('../remove-uploaded-file.js')).default
    await removeUploadFile(request, h)
    expect(mockRemoveUploadedFile).toHaveBeenCalledWith('afda812d-c4df-4182-9978-19e6641c4a6e', '9d62e5b8-9c77-ec11-8d21-000d3a87431b')
    expect(mockGetUploadedFiles).toHaveBeenCalledWith('afda812d-c4df-4182-9978-19e6641c4a6e')
    expect(mockRedirect).toHaveBeenCalledWith('/upload-supporting-information')
  })

  it('should not call remove upload file when there is no uploadId', async () => {
    const mockRemoveUploadedFile = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', uploadId: '1234567' }))
    const mockGetUploadedFiles = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))
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
        APPLICATION: {
          tags: () => {
            return {
              remove: () => false
            }
          }
        },
        FILE_UPLOAD: {
          removeUploadedFile: mockRemoveUploadedFile,
          getUploadedFiles: mockGetUploadedFiles
        }
      }
    }))
    const removeUploadFile = (await import('../remove-uploaded-file.js')).default
    await removeUploadFile(request, h)
    expect(mockRemoveUploadedFile).not.toHaveBeenCalled()
    expect(mockGetUploadedFiles).toHaveBeenCalledWith('afda812d-c4df-4182-9978-19e6641c4a6e')
    expect(mockRedirect).toHaveBeenCalledWith('/upload-supporting-information')
  })

  it('should handle correctly the API and redirect to the check-supporting-information', async () => {
    const mockRemoveUploadedFile = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', uploadId: '1234567' }))
    const mockGetUploadedFiles = jest.fn(() => ([{ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }]))
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
        APPLICATION: {
          tags: () => {
            return {
              remove: () => false
            }
          }
        },
        FILE_UPLOAD: {
          removeUploadedFile: mockRemoveUploadedFile,
          getUploadedFiles: mockGetUploadedFiles
        }
      }
    }))
    const removeUploadFile = (await import('../remove-uploaded-file.js')).default
    await removeUploadFile(request, h)
    expect(mockRemoveUploadedFile).toHaveBeenCalled()
    expect(mockGetUploadedFiles).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/check-supporting-information')
  })
})
