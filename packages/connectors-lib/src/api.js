import fetch from 'node-fetch'
import db from 'debug'
import { HTTPResponseError, execOkOrNull } from './fetch-helper.js'
const API_URL_DEFAULT = 'http://0.0.0.0:4000'
const API_TIMEOUT_MS_DEFAULT = 20000
const urlBase = `http://${process.env.API_HOST}:${process.env.API_PORT}` || API_URL_DEFAULT
const debug = db('connectors:api')

/**
 * Make a request to the sales API
 *
 * @param url the URL of the endpoint to make a request to
 * @param method the HTTP method (defaults to get)
 * @param payload the payload to include with a put/post/patch request
 * @returns {Promise<{statusText: *, ok: *, body: *, status: *}>}
 */
export const call = async (url, method = 'get', payload = null) => {
  const requestTimestamp = new Date().toISOString()
  const response = await fetch(url.href, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...(payload && { body: JSON.stringify(payload) })
  })
  const responseTimestamp = new Date().toISOString()
  const responseData = {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: response.status !== 204 ? await response.json() : undefined
  }
  debug(
    'Request sent (%s): %s %s with payload %o.  Response received (%s): %o',
    requestTimestamp,
    method,
    url.href,
    payload,
    responseTimestamp,
    responseData
  )
  return response
}

/**
 * Retrieve the response json, falling back to reading text on error
 *
 * @param response node-fetch response object
 * @returns {Promise<{}>}
 */
const parseResponseBody = async response => {
  const body = await response.text()
  try {
    return JSON.parse(body)
  } catch (e) {
    return {
      text: body
    }
  }
}

export const API = {
  get: async path => exec2xxOrNull(call(new URL(path, urlBase), 'get')),
  put: async (path, payload) => checkStatus(call(new URL(path, urlBase), 'put', payload)),
  post: async (path, payload) => checkStatus(call(new URL(path, urlBase), 'post', payload)),
  delete: async path => checkStatus(call(new URL(path, urlBase), 'delete'))
}
