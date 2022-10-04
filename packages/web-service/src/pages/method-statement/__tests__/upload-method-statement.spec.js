
describe('the upload-method-statement page handler', () => {
  beforeEach(() => jest.resetModules())

  it('without error returns the check your answers page', async () => {
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const request = {
      payload: {
        'scan-file': {
          filename: 'hello.txt',
          path: '/tmp/123'
        }
      },
      cache: () => ({
        getData: jest.fn(() => ({})),
        setData: jest.fn(),
        clearPageData: jest.fn(),
        getPageData: jest.fn(() => ({}))
      })
    }
    jest.doMock('../../../services/virus-scan.js', () => ({
      scanFile: jest.fn(() => false)
    }))
    const { uploadMethodStatement } = await import('../upload-method-statement.js')
    const [, postRoute] = uploadMethodStatement
    const mockRedirect = jest.fn()
    const h = {
      redirect: mockRedirect
    }
    await postRoute.handler(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/check-method-statement')
  })

  it('with error returns the upload method-statement page', async () => {
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const request = {
      payload: {
        'scan-file': {
          filename: 'hello.txt',
          path: '/tmp/123'
        }
      },
      cache: () => ({
        getData: jest.fn(() => ({})),
        setData: jest.fn(),
        setPageData: jest.fn(),
        getPageData: jest.fn(() => ({ error: 'error ' }))
      })
    }
    jest.doMock('../../../services/virus-scan.js', () => ({
      scanFile: jest.fn(() => true)
    }))
    const { uploadMethodStatement } = await import('../upload-method-statement.js')
    const [, postRoute] = uploadMethodStatement
    const mockRedirect = jest.fn()
    const h = {
      redirect: mockRedirect
    }
    await postRoute.handler(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/upload-method-statement')
  })

  it('calls the s3 upload and returns to the check-method-statement', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          fileUpload: { filename: 'hello.txt', path: '/tmp/path' },
          applicationId: 123
        }),
        getPageData: () => ({
          payload: {
            'another-file-check': 'no'
          }
        })
      })
    }

    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: ({
        APPLICATION: {
          tags: () => {
            return {
              add: () => false
            }
          }
        }
      })
    }))

    const mockS3FileUpload = jest.fn()
    jest.doMock('../../../services/s3-upload.js', () => ({
      s3FileUpload: mockS3FileUpload
    }))
    const { completion } = await import('../upload-method-statement.js')
    const result = await completion(request)
    expect(result).toEqual('/check-method-statement')
    expect(mockS3FileUpload).toHaveBeenCalledWith(123, 'hello.txt', '/tmp/path',
      { filetype: 'METHOD-STATEMENT', multiple: true })
  })
})
