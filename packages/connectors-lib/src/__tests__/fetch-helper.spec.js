import { checkResponseOkElseThrow } from '../fetch-helper.js'

const httpResponse = {
  OK: 200,
  NO_CONTENT: 204,
  NOT_FOUND: 404
}

describe('The fetch helper', () => {
  beforeEach(() => { jest.resetModules() })

  describe('#checkResponseOkElseThrow', () => {
    it('should return null for a successful no-content response', async () => {
      const responsePromise = Promise.resolve({
        ok: true,
        status: httpResponse.NO_CONTENT,
        headers: new Map([['content-type', 'application/json']])
      })

      const result = await checkResponseOkElseThrow(responsePromise)

      expect(result).toBeNull()
    })

    it('should return JSON for a successful response with content-type: application/json', async () => {
      const responseData = { key: 'value' }
      const responsePromise = Promise.resolve({
        ok: true,
        status: httpResponse.OK,
        headers: new Map([['content-type', 'application/json']]),
        json: jest.fn(() => Promise.resolve(responseData))
      })

      const result = await checkResponseOkElseThrow(responsePromise)

      expect(result).toEqual(responseData)
    })

    it('should return response body for a successful response with other content-type', async () => {
      const responseBody = 'plain text'
      const responsePromise = Promise.resolve({
        ok: true,
        status: httpResponse.OK,
        headers: new Map([['content-type', 'text/plain']]),
        body: responseBody
      })

      const result = await checkResponseOkElseThrow(responsePromise)

      expect(result).toEqual(responseBody)
    })

    it('should return null for a not found response', async () => {
      const responsePromise = Promise.resolve({
        ok: false,
        status: httpResponse.NOT_FOUND
      })

      const result = await checkResponseOkElseThrow(responsePromise)

      expect(result).toBeNull()
    })

    it('should throw an error for other error responses', async () => {
      const responsePromise = Promise.resolve({
        ok: false,
        status: 500
      })

      await expect(checkResponseOkElseThrow(responsePromise)).rejects.toThrow()
    })
  })
})
