export default (_path, view, completion, getData) => ({
  get: async (request, h) => {
    const data = {}

    const pageData = await getData(request)

    Object.assign(data, { data: pageData })

    return h.view(view, data)
  },
  post: async (request, h) => {
    if (typeof completion === 'function') {
      return h.redirect(await completion(request))
    } else {
      return h.redirect(completion)
    }
  }
})
