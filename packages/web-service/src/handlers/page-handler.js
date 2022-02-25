export default (path, view, completion, getData) => ({
  get: async (request, handler) => {
    const data = {}

    const pageData = await getData(request)
    Object.assign(data, { data: pageData })

    return handler.view(view, data)
  },
  post: async (request, handler) => {
    return handler.redirect(completion)
  },
  error: async (request, handler, error) => {
    return handler.redirect(request.path).takeover()
  }
})
