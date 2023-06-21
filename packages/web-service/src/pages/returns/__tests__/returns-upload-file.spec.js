jest.spyOn(console, 'error').mockImplementation(() => null)

describe('Upload returns file', () => {
  beforeEach(() => jest.resetModules())

  it('should call the s3 upload and redirects to the returns uploaded files page', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          fileUpload: { filename: 'hello.txt', path: '/tmp/path' },
          applicationId: 123,
          returns: {
            id: '12345678'
          }
        }),
        getPageData: jest.fn(() => ({}))
      })
    }

    const mockS3FileUpload = jest.fn()
    const mockS3FileUploadWrapper = jest.fn().mockImplementation(() => mockS3FileUpload)
    jest.doMock('../../../services/s3-upload.js', () => ({
      s3FileUpload: mockS3FileUploadWrapper
    }))
    const { completion } = await import('../returns-upload-file.js')
    const result = await completion(request)
    expect(result).toEqual('/returns-uploaded-files')
    expect(mockS3FileUpload).toHaveBeenCalledWith('12345678')
    expect(mockS3FileUploadWrapper).toHaveBeenCalledWith('RETURN', 'hello.txt', '/tmp/path',
      {
        filetype: 'METHOD-STATEMENT',
        multiple: true,
        supportedFileTypes: ['ZIP', 'JPG', 'PNG', 'TIF', 'BMP', 'GEOJSON', 'KML', 'DOC', 'DOCX', 'PDF', 'ODT', 'XLS', 'XLSX', 'ODS', 'CPG', 'DBF', 'PRJ', 'SBN', 'SBX', 'SHP', 'SHP.XML', 'SHX']
      })
  })

  it('should not call the s3 upload and redirects to the returns uploaded files page', async () => {
    const request = {
      cache: () => ({
        getData: () => ({}),
        getPageData: jest.fn(() => ({}))
      })
    }
    const { completion } = await import('../returns-upload-file.js')
    expect(await completion(request)).toStrictEqual('/returns-uploaded-files')
  })

  it('getData clears page data', async () => {
    const mockClearPageData = jest.fn()
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
        })),
        clearPageData: mockClearPageData
      })
    }
    const { getData } = await import('../returns-upload-file.js')
    await getData(request)
    expect(mockClearPageData).toHaveBeenCalled()
  })
})
