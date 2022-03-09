export default (path, view, completion, getData) => ({
  get: async (request, handler) => {
    const data = {}

    const pageData = await getData(request)
    // NOSONAR
    Object.assign(data, { data: pageData })
  // NOSONAR
    return handler.view(view, data)
  }
})
