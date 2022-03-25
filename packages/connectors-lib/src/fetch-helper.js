/**
 * Generic fetch operations supporting API and Power Platform requests
 */
import db from 'debug'
import pkg from 'node-fetch'
const fetch = pkg.default

const debug = db('connectors:fetch')
const abortController = new global.AbortController()
const DEFAULT_TIMEOUT = 20000
const APPLICATION_JSON = 'application/json'
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
  if (response.ok) {
    if (response.status === 204) {
      return null
    } else {
      if (response.headers.get('content-type').includes(APPLICATION_JSON)) {
        return response.json()
      } else {
        return response.body
      }
    }
  } else {
    if (response.status === 404) {
      return null
    } else {
      throw new HTTPResponseError(response)
    }
  }
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
export const httpFetch = async (url, method, payload, headerFunc, responseFunc = checkResponseOkElseThrow, timeOutMS = DEFAULT_TIMEOUT) => {
  const headers = headerFunc && typeof headerFunc === 'function'
    ? await headerFunc()
    : { 'Content-Type': APPLICATION_JSON, Accept: APPLICATION_JSON }

  const options = {
    headers,
    method,
    signal: abortController.signal,
    ...payload && { body: payload }
  }

  debug(`Making HTTP request to ${url} with options: \n${JSON.stringify(options, null, 4)}`)

  // Create a timeout
  const timeout = setTimeout(() => {
    abortController.abort()
  }, parseInt(timeOutMS))

  try {
    // Make the request
    const responsePromise = fetch(url, options)

    // Run the supplied async response function
    const result = await responseFunc(responsePromise)
    debug(`HTTP response: ${result}`)
    return result
  } catch (err) {
    if (err.name === 'AbortError') {
      // Create a client timeout response
      throw new HTTPResponseError({ status: 408, statusText: 'Request Timeout' })
    } else {
      throw err
    }
  } finally {
    clearTimeout(timeout)
  }
}
