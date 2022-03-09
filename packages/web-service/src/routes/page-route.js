import handler from '../handlers/page-handler.js'

export default (view, path, _validator, completion, getData) => [
  {
    method: 'GET',
    path: path,
    handler: handler(path, view, completion, getData).get
  }
]
