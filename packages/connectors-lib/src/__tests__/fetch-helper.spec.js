import { checkResponseOkElseThrow } from '../fetch-helper.js'

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

const jsonHeaders = new Map([['content-type', 'application/json']])
const plainTextHeaders = new Map([['content-type', 'text/plain']])

describe('The fetch helper', () => {
  beforeEach(() => { jest.resetModules() })

  describe('#checkResponseOkElseThrow', () => {
    it('should return null for a successful no-content response', async () => {
      const responsePromise = Promise.resolve({
        ok: true,
        status: HTTP_STATUS.NO_CONTENT,
        headers: jsonHeaders
      })

      const result = await checkResponseOkElseThrow(responsePromise)

      expect(result).toBeNull()
    })

    it('should return JSON for a successful response with content-type: application/json', async () => {
      const responseData = { response: true }
      const responsePromise = Promise.resolve({
        ok: true,
        status: HTTP_STATUS.OK,
        headers: jsonHeaders,
        json: jest.fn(() => Promise.resolve(responseData))
      })

      const result = await checkResponseOkElseThrow(responsePromise)

      expect(result).toEqual(responseData)
    })

    it('should return response body for a successful response with other content-type', async () => {
      const responseBody = 'plain text'
      const responsePromise = Promise.resolve({
        ok: true,
        status: HTTP_STATUS.OK,
        headers: plainTextHeaders,
        body: responseBody
      })

      const result = await checkResponseOkElseThrow(responsePromise)

      expect(result).toEqual(responseBody)
    })

    it('should return null for a not found response', async () => {
      const responsePromise = Promise.resolve({
        ok: false,
        status: HTTP_STATUS.NOT_FOUND
      })

      const result = await checkResponseOkElseThrow(responsePromise)

      expect(result).toBeNull()
    })

    it('should throw an error for other error responses', async () => {
      const responsePromise = Promise.resolve({
        ok: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })

      await expect(checkResponseOkElseThrow(responsePromise)).rejects.toThrow()
    })
  })

  describe('#httpFetch', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should make a successful GET request with default headers', async () => {
      const url = 'https://example.com'
      const method = 'GET'
      const payload = null
      const headerFunc = null

      const responseData = { response: true }
      const response = {
        ok: true,
        status: HTTP_STATUS.OK,
        headers: jsonHeaders,
        json: jest.fn(() => Promise.resolve(responseData))
      }

      const mockFetch = jest.fn(() => Promise.resolve(response))
      jest.doMock('node-fetch', () => ({ default: mockFetch }))
      const { httpFetch } = (await import('../fetch-helper.js'))

      const result = await httpFetch(url, method, payload, headerFunc)

      expect(mockFetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }))

      expect(result).toEqual(responseData)
    })

    it('should make a POST request with custom headers and payload', async () => {
      const url = 'https://example.com'
      const method = 'POST'
      const payload = { payload: true }
      const headerFunc = async () => ({ Authorization: 'Bearer token' })

      const responseData = { response: true }
      const response = {
        ok: true,
        status: HTTP_STATUS.CREATED,
        headers: jsonHeaders,
        json: jest.fn(() => Promise.resolve(responseData))
      }

      const mockFetch = jest.fn(() => Promise.resolve(response))
      jest.doMock('node-fetch', () => ({ default: mockFetch }))
      const { httpFetch } = (await import('../fetch-helper.js'))

      const result = await httpFetch(url, method, payload, headerFunc)

      expect(mockFetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method,
        headers: {
          Authorization: 'Bearer token'
        },
        body: payload
      }))

      expect(result).toEqual(responseData)
    })

    it('should handle FetchError and rethrow it', async () => {
      const url = 'https://example.com'
      const method = 'GET'
      const payload = null
      const headerFunc = null

      const FetchError = new Error()
      FetchError.name = 'FetchError'

      const mockFetch = jest.fn(() => { throw FetchError })
      jest.doMock('node-fetch', () => ({ default: mockFetch }))
      const { httpFetch } = (await import('../fetch-helper.js'))

      await expect(httpFetch(url, method, payload, headerFunc)).rejects.toThrow(FetchError)
    })

    it('should handle an unknown error and rethrow it', async () => {
      const url = 'https://example.com'
      const method = 'GET'
      const payload = null
      const headerFunc = null

      const UnknownError = new Error('Unknown error')

      const mockFetch = jest.fn(() => { throw UnknownError })
      jest.doMock('node-fetch', () => ({ default: mockFetch }))
      const { httpFetch } = (await import('../fetch-helper.js'))

      await expect(httpFetch(url, method, payload, headerFunc)).rejects.toThrow(UnknownError)
    })

    it('should handle an error containing a text response and rethrow it', async () => {
      const url = 'https://example.com'
      const method = 'GET'
      const payload = null
      const headerFunc = null

      const errorResponse = 'ERROR'
      const ResponseError = new Error()
      ResponseError.response = {
        headers: plainTextHeaders,
        body: jest.fn(() => Promise.resolve(errorResponse))
      }

      const mockFetch = jest.fn(() => { throw ResponseError })
      jest.doMock('node-fetch', () => ({ default: mockFetch }))
      const { httpFetch } = (await import('../fetch-helper.js'))

      await expect(httpFetch(url, method, payload, headerFunc)).rejects.toThrow(`response error: ${errorResponse}`)
    })

    it('should handle an error containing a json response and rethrow it', async () => {
      const url = 'https://example.com'
      const method = 'GET'
      const payload = null
      const headerFunc = null

      const errorResponse = { error: true }
      const ResponseError = new Error()
      ResponseError.response = {
        headers: jsonHeaders,
        json: jest.fn(() => Promise.resolve({ error: true }))
      }

      const mockFetch = jest.fn(() => { throw ResponseError })
      jest.doMock('node-fetch', () => ({ default: mockFetch }))
      const { httpFetch } = (await import('../fetch-helper.js'))

      await expect(httpFetch(url, method, payload, headerFunc)).rejects.toThrow(`response error: ${JSON.stringify(errorResponse)}`)
    })

    it('should handle a successful response with custom responseFunc', async () => {
      const url = 'https://example.com'
      const method = 'GET'
      const payload = null
      const headerFunc = null
      const customResponseFunc = jest.fn().mockReturnValue('Custom response')

      const responsePromise = Promise.resolve({
        ok: true,
        status: HTTP_STATUS.OK,
        headers: jsonHeaders
      })

      const mockFetch = jest.fn(() => responsePromise)
      jest.doMock('node-fetch', () => ({ default: mockFetch }))
      const { httpFetch } = (await import('../fetch-helper.js'))

      const result = await httpFetch(url, method, payload, headerFunc, customResponseFunc)

      expect(customResponseFunc).toHaveBeenCalledWith(responsePromise)
      expect(result).toEqual('Custom response')
    })
  })
})
