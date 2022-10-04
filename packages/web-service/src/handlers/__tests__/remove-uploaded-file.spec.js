
describe('the remove-uploaded-file handler function', () => {
  beforeEach(() => jest.resetModules())

  it('correctly calls the API and saves the journey data', async () => {
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
    expect(mockRedirect).toHaveBeenCalledWith('/upload-method-statement')
  })
})
