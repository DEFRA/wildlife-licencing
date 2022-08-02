
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
})
