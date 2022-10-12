
describe('the upload-supporting-information page handler', () => {
  beforeEach(() => jest.resetModules())

  it('should calls the s3 upload and redirects to the check-supporting-information page', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          fileUpload: { filename: 'hello.txt', path: '/tmp/path' },
          applicationId: 123
        }),
        getPageData: jest.fn(() => ({}))
      })
    }

    const mockS3FileUpload = jest.fn()
    jest.doMock('../../../services/s3-upload.js', () => ({
      s3FileUpload: mockS3FileUpload
    }))
    const { completion } = await import('../upload-supporting-information.js')
    const result = await completion(request)
    expect(result).toEqual('/check-supporting-information')
    expect(mockS3FileUpload).toHaveBeenCalledWith(123, 'hello.txt', '/tmp/path',
      { filetype: 'METHOD-STATEMENT', multiple: true })
  })

  it('should redirect the user to  the upload-supporting-information page when the uploaded file is infected', async () => {
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const request = {
      payload: {
        'scan-file': {
          filename: 'testFile.txt',
          path: '/temporary/storage'
        }
      },
      cache: () => ({
        getData: jest.fn(() => ({})),
        setData: jest.fn(),
        setPageData: jest.fn(),
        getPageData: jest.fn(() => ({ error: 'FILE_INFECTED_ERROR ' }))
      })
    }
    jest.doMock('../../../services/virus-scan.js', () => ({
      scanFile: jest.fn(() => true)
    }))
    const { uploadSupportingInformation } = await import('../upload-supporting-information.js')
    const [, postRoute] = uploadSupportingInformation
    const mockRedirect = jest.fn()
    const h = {
      redirect: mockRedirect
    }
    await postRoute.handler(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/upload-supporting-information')
  })
})
