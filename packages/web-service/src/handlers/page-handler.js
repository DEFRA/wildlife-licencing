export default (_path, view, completion, getData) => ({
  get: async (request, handler) => {
    const data = {}

    const pageData = await getData(request)

    Object.assign(data, { data: pageData })

    return handler.view(view, data)
  },
  post: async (request, handler) => {
    if (typeof completion === 'function') {
      return handler.redirect(await completion(request))
    } else {
      return handler.redirect(completion)
    }
  },
})
