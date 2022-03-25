import handler from '../handlers/page-handler.js'

export default (view, path, validator, completion, getData, setData, options) => [
  {
    method: 'GET',
    path: path,
    handler: handler(path, view, completion, getData).get,
    options
  },
  {
    method: 'POST',
    path: path,
    handler: handler(path, view, completion, null, setData).post,
    options: {
      ...options,
      validate: {
        payload: validator,
        failAction: handler(path, view, completion).error
      }
    }
  }
]
