/**
 * Generic fetch operations supporting API and Power Platform requests
 */
import db from 'debug'
import pkg from 'node-fetch'
const fetch = pkg.default

const debug = db('connectors:fetch')
const abortController = new global.AbortController()
const DEFAULT_TIMEOUT = 20000

export class HTTPResponseError extends Error {
  constructor (response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`)
    this.response = response
  }
}

export const checkOkOrThrow = async responsePromise => {
  const response = await responsePromise
  if (response.ok) {
    return response
  }
  throw new HTTPResponseError(response)
}

export const checkOkJsonOrThrow = async responsePromise => {
  const response = await responsePromise
  if (response.ok) {
    return response.json()
  }
  throw new HTTPResponseError(response)
}

export const checkOkJsonOrNull = async responsePromise => {
  const response = await responsePromise
  return (response.ok && response.json()) || null
}

/**
 * Make a general HTTP request using node-fetch. Deal with timeouts and exceptions
 * @param url - The fully qualified endpoint of the exception
 * @param method - GET POST PUT DELETE
 * @param payload - The body of the request
 * @param headerFunc - A function to return the set of headers
 * @param responseFunc - A function to parse on the reponse
 * @param timeOutMS - The Timeout in milliseconds
 * @returns {Promise<*|*>}
 */
export const httpFetch = async (url, method, payload, headerFunc, responseFunc, timeOutMS) => {
  const headers = headerFunc && typeof headerFunc === 'function'
    ? await headerFunc()
    : { 'Content-Type': 'application/json', Accept: 'application/json' }

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
  }, parseInt(timeOutMS) || DEFAULT_TIMEOUT)

  try {
    // Make the request
    const response = fetch(url, options)

    // Run the supplied async response function
    if (responseFunc && typeof responseFunc === 'function') {
      const res = await responseFunc(response)
      debug(`HTTP response: ${res}`)
      return res
    } else {
      debug(`HTTP response: ${response}`)
      return response
    }
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
