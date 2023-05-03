
describe('the upload-supporting-information page handler', () => {
  beforeEach(() => jest.resetModules())

  it('should call the s3 upload and redirects to the check-supporting-information page', async () => {
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
    const mockS3FileUploadWrapper = jest.fn().mockImplementation(() => mockS3FileUpload)
    jest.doMock('../../../services/s3-upload.js', () => ({
      s3FileUpload: mockS3FileUploadWrapper
    }))
    const { completion } = await import('../upload-supporting-information.js')
    const result = await completion(request)
    expect(result).toEqual('/check-supporting-information')
    expect(mockS3FileUpload).toHaveBeenCalledWith(123)
    expect(mockS3FileUploadWrapper).toHaveBeenCalledWith('APPLICATION', 'hello.txt', '/tmp/path',
      {
        filetype: 'METHOD-STATEMENT',
        multiple: true,
        supportedFileTypes: [
          'JPG',
          'PNG',
          'TIF',
          'BMP',
          'GEOJSON',
          'KML',
          'SHAPE',
          'DOC',
          'DOCX',
          'PDF',
          'ODT',
          'XLS',
          'XLSX',
          'ODS'
        ]
      })
  })

  it('should not call the s3 upload and redirects to the check-supporting-information page', async () => {
    const request = {
      cache: () => ({
        getData: () => ({}),
        getPageData: jest.fn(() => ({}))
      })
    }
    const { completion } = await import('../upload-supporting-information.js')
    expect(await completion(request)).toStrictEqual('/check-supporting-information')
  })

  it('getData sets the tag', async () => {
    const mockSet = jest.fn()
    const mockClearPageData = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              get: () => 'not-started',
              set: mockSet
            }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
        })),
        clearPageData: mockClearPageData
      })
    }
    const { getData } = await import('../upload-supporting-information.js')
    expect(await getData(request)).toBe(null)
    expect(mockClearPageData).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalledWith({ tag: 'supporting-information', tagState: 'in-progress' })
  })
})
