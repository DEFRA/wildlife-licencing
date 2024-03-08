/**
 * Generic fetch operations supporting API and Power Platform requests
 */
import db from 'debug'
import pkg from 'node-fetch'
const fetch = pkg.default

const debug = db('connectors-lib:fetch')
const debugTime = db('connectors-lib:fetch-performance')

const DEFAULT_TIMEOUT = '20000'
const APPLICATION_JSON = 'application/json'

const HTTP_STATUS = {
  NO_CONTENT: 204,
  NOT_FOUND: 404
}

/**
 * When logging http requests we want to specifically redact objects that are in this format to avoid cluttering the
 * logs with long (and potentially sensitive) Buffer arrays:
 *
 * { type: "Buffer", data: [42, 75, 66, 66, 65, 72, 20, 42, 75, 66, 66, 65, 72, 20, 42, 75, 66, 66, 65, 72] }
 *
 * So when we stringify data we use this replacer function to identify objects like this and truncate the `data` array
 * to just the first 10 entries with '...' appended:
 *
 * { type: "Buffer", data: [42, 75, 66, 66, 65, 72, 20, 42, 75, 66, '...'] }
 */
const redactBufferArrays = (_key, value) => {
  // If this isn't an object make no changes
  if (typeof value !== 'object' || value === null) { return value }

  // If the object's `type` and `data` don't exist or aren't what we expect, make no changes
  if (!('type' in value) || !('data' in value)) { return value }
  if (value.type !== 'Buffer' || !Array.isArray(value.data)) { return value }

  // Otherwise, reaplce the data array with a truncated version
  return {
    ...value,
    data: [...value.data.slice(0, 10), '...']
  }
}

export class HTTPResponseError extends Error {
  constructor (response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`)
    this.response = response
  }
}

/**
 * General behaviour on response. Will throw exceptions on any failure except
 * not found, and will de-serialize json responses, return null on no-content
 * or return the stream in all other cases
 * @param responsePromise
 * @returns {Promise<null|*>}
 */
export const checkResponseOkElseThrow = async responsePromise => {
  const response = await responsePromise
  debug(`HTTP response code: ${JSON.stringify(response.status)}`)
  if (!response.ok) {
    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return null
    }

    throw new HTTPResponseError(response)
  }

  if (response.status === HTTP_STATUS.NO_CONTENT) {
    return null
  }

  if (response.headers.get('content-type').includes(APPLICATION_JSON)) {
    return response.json()
  }

  return response.body
}

/**
 * Make a general HTTP request using node-fetch. Deal with timeouts and exceptions.
 * Allows different behaviour for the Power Platform and API etc. with respect to responses
 * @param url - The fully qualified endpoint of the exception
 * @param method - GET POST PUT DELETE
 * @param payload - The body of the request
 * @param headerFunc - A function to return the set of headers
 * @param responseFunc - A function to parse on the reponse
 * @param timeOutMS - The Timeout in milliseconds
 * @returns {Promise<*|*>}
 */
export const httpFetch = async (url, method, payload, headerFunc, responseFunc = checkResponseOkElseThrow,
  timeOutMS = DEFAULT_TIMEOUT, additionalOptions = {}) => {
  const headers = headerFunc && typeof headerFunc === 'function'
    ? await headerFunc()
    : { 'Content-Type': APPLICATION_JSON, Accept: APPLICATION_JSON }

  const abortController = new global.AbortController()

  const options = {
    headers,
    method,
    signal: abortController.signal,
    ...payload && { body: payload },
    ...additionalOptions
  }

  debug(`Making HTTP request to ${url} with options: ${JSON.stringify(options, redactBufferArrays)}`)

  // Create a timeout
  debug(`Setting timeout ${parseInt(timeOutMS)}...`)
  const timeout = setTimeout(() => {
    debug('Request timeout: abort controller ')
    abortController.abort()
  }, parseInt(timeOutMS))

  try {
    // Make the request
    const startTs = Date.now()

    const responsePromise = fetch(url, options)

    // Run the supplied async response function
    const result = await responseFunc(responsePromise)
    debug(`HTTP response data: ${JSON.stringify(result)}`)

    const endTs = Date.now()
    debugTime(`${url},${options.method} ${endTs - startTs}ms`)

    return result
  } catch (err) {
    if (err.name === 'AbortError') {
      // Create a client timeout response
      console.error('Fetch ABORT error', err)
      throw new HTTPResponseError({ status: 408, statusText: 'Request Timeout' })
    }

    if (err.name === 'FetchError') {
      console.error('Fetch REQUEST error', err)
      throw err
    }

    if (err.response) {
      const msg = 'response error: ' + err.response.headers.get('content-type').includes(APPLICATION_JSON)
        ? JSON.stringify(await err.response.json())
        : await err.response.body()
      console.error(`Unknown error thrown in fetch: ${msg}`)
      throw new Error(msg)
    }

    throw err
  } finally {
    debug('Request timeout clear ')
    clearTimeout(timeout)
  }
}
