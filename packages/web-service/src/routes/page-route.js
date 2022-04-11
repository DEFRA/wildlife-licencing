import handler from '../handlers/page-handler.js'

/**
 * Wrapper which creates a pair of handlers conforming to the pattern of the page handler functions in
 * src/handlers/page-handler.js, it creates a GET, POST and POST validator
 * @param view - The view name, always the name of the nunjunks template
 * @param path - The URI which the handler responds on
 * @param checkData - A function of the form h = checkData(request, h) =>  allowing the service to check that page
 * requirements are met before the page is displayed.
 * If the function returns a non-null the get handler will return the result immediately,
 * the function may typically return h.redirect
 *
 * @param getData - A function of the form getData(request) which retrieves an object available to the view as { data }
 * @param validator - A Joi validator or any function that throws Joi.ValidationError when user input fails validation.
 * @param completion - A function of the form uri = completion(request) where the system will redirect the browser
 * to the request specified by uri
 * @param setData - A function of the form setData(request) which occurs on successful form submission
 * @param options - Route options
 * @returns {[{path, handler: ((function(*=, *): Promise<*>)|*), method: string, options},
 * {path, handler: ((function(*=, *): Promise<*>)|*), method: string, options: (*&{validate:
 * {payload, failAction: ((function(*, *, *=): Promise<*|undefined>)|*)}})}]}
 */
export default (view, path, checkData, getData, validator, completion, setData, options) => [
  {
    method: 'GET',
    path: path,
    handler: handler(view, checkData, getData).get,
    options
  },
  {
    method: 'POST',
    path: path,
    handler: handler(null, null, null, completion, setData).post,
    options: {
      ...options,
      validate: {
        payload: validator,
        failAction: handler().error
      }
    }
  }
]
