export default (path, view, completion, getData) => ({
  get: async (request, handler) => {
    return handler.view(view, { data: await getData(request) })
  },
  post: async (request, handler) => {
    return handler.redirect(completion)
  },
  error: async (request, handler, error) => {
    return handler.redirect(request.path).takeover()
  }
})
