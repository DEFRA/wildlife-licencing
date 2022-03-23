import { HTTPResponseError, httpFetch, checkOkJsonOrNull, checkOkJsonOrThrow } from './fetch-helper.js'
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
      checkOkJsonOrNull,
      Config.powerApps.client.timeout),

  post: async (path, payload = {}) =>
    httpFetch(apiUrl(path),
      'POST',
      JSON.stringify(payload),
      null,
      checkOkJsonOrThrow,
      Config.powerApps.client.timeout),

  HTTPResponseError
}
