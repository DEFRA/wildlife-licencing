import { HTTPResponseError, httpFetch, checkResponseOkElseThrow } from './fetch-helper.js'
import Config from './config.js'

const apiUrl = (path, query) => {
  const url = new URL(`http:${Config.api.host}`)
  url.port = Config.api.port
  url.pathname = path
  if (query) {
    const params = new URLSearchParams(query)
    url.search = params.toString()
  }
  return url.href
}

export const API = {
  get: async (path, query = null) =>
    httpFetch(apiUrl(path, query),
      'GET',
      null,
      null,
      checkResponseOkElseThrow,
      Config.api.timeout),

  post: async (path, payload = {}) =>
    httpFetch(apiUrl(path),
      'POST',
      JSON.stringify(payload),
      null,
      checkResponseOkElseThrow,
      Config.api.timeout),

  put: async (path, payload = {}) =>
    httpFetch(apiUrl(path),
      'PUT',
      JSON.stringify(payload),
      null,
      checkResponseOkElseThrow,
      Config.api.timeout),

  delete: async path =>
    httpFetch(apiUrl(path),
      'DELETE',
      null,
      null,
      checkResponseOkElseThrow,
      Config.api.timeout),

  HTTPResponseError
}
