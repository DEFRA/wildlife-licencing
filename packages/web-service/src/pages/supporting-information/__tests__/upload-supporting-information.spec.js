
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
})
