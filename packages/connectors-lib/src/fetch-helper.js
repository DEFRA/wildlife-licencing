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

export const checkOkOrThrow = response => {
  if (response.ok) {
    return response
  }
  throw new HTTPResponseError(response)
}

export const checkOkJsonOrThrow = async response => {
  if (response.ok) {
    return response.json()
  }
  throw new HTTPResponseError(response)
}

export const checkOkJsonOrNull = async response => {
  return (response.ok && response.json()) || null
}

export const httpFetch = async (urlBase, path, method, payload, headerFunc, responseFunc, timeOutSeconds) => {
  const fetchURL = new URL(`${urlBase}/${path}`).href

  const headers = headerFunc && typeof headerFunc === 'function'
    ? await headerFunc()
    : { 'Content-Type': 'application/json', Accept: 'application/json' }

  const options = {
    headers,
    method,
    signal: abortController.signal,
    ...payload && { body: payload }
  }

  debug(`Making HTTP request to ${fetchURL} with options: ${JSON.stringify(options)}`)

  // Create a timeout
  const timeout = setTimeout(() => {
    abortController.abort()
  }, parseInt(timeOutSeconds) || DEFAULT_TIMEOUT)

  try {
    // Make the request
    const response = fetch(fetchURL, options)

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
