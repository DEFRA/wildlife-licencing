import { ERRORS } from '../uris.js'

/**
 * Handle 400 and 500 errors
 * @param request
 * @param h
 * @returns {string|((key?: IDBValidKey) => void)|*}
 */
export const errorHandler = (request, h) => {
  if (!request.response.isBoom) {
    return h.continue
  }
  if (request?.response?.output?.statusCode === 404) {
    /*
     * 404 page not found client errors
     */
    return h
      .view(ERRORS.CLIENT.page, {
        clientError: request.response.output.payload
      })
      .code(request.response.output.statusCode)
  } else {
    // other 4xx or 5xx errors
    const requestDetail = {
      url: request.url,
      path: request.path,
      query: request.query,
      params: request.params,
      payload: request.payload,
      headers: request.headers,
      state: request.state,
      method: request.method
    }

    console.error('Error processing request. Request: %j', requestDetail)
    return h
      .view(ERRORS.SERVER.page, {
        serverError: request.response.output.payload
      })
      .code(request.response.output.statusCode)
  }
}
