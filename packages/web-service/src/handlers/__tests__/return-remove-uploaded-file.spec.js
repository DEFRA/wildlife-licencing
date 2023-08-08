
describe('the remove-uploaded-file handler function', () => {
  beforeEach(() => jest.resetModules())

  it('should not call remove upload file when there is no uploadId or returnId', async () => {
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
          RETURN: {
            removeUploadedFile: mockRemoveUploadedFile
          }
        }
      }
    }))
    const removeUploadFile = (await import('../return-remove-uploaded-file.js')).default
    await removeUploadFile(request, h)
    expect(mockRemoveUploadedFile).not.toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/returns-uploaded-files')
  })

  it('should remove the upload the return file and redirect to the returns uploaded files check page', async () => {
    const mockRemoveUploadedFile = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', uploadId: '1234567' }))
    const mockRedirect = jest.fn()
    const mockGetData = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', returns: { id: '12345' } }))
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
          RETURN: {
            removeUploadedFile: mockRemoveUploadedFile
          }
        }
      }
    }))
    const removeUploadFile = (await import('../return-remove-uploaded-file.js')).default
    await removeUploadFile(request, h)
    expect(mockRemoveUploadedFile).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/returns-uploaded-files')
  })
})
