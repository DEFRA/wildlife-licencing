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
  if (Math.floor(request.response.output.statusCode / 100) === 4) {
    /*
     * 4xx client errors and are not logged
     */
    return h
      .view(ERRORS.CLIENT.page, {
        clientError: request.response.output.payload
      })
      .code(request.response.output.statusCode)
  } else {
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

    console.error('Error processing request. Request: %j, Exception: %o', requestDetail, request.response)

    return h
      .view(ERRORS.SERVER.page, {
        serverError: request.response.output.payload
      })
      .code(request.response.output.statusCode)
  }
}
