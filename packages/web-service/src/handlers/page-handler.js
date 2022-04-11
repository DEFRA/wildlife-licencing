export const errorShim = e => e.details.reduce((a, c) => ({ ...a, [c.path[0]]: c.type }), {})
export default (view, checkData, getData, completion, setData) => ({
  get: async (request, h) => {
    // If checkData exists call it and if returning truthy, return
    if (checkData && typeof checkData === 'function') {
      const check = await checkData(request, h)
      if (check) {
        return check
      }
    }

    // Page data is automatically handled payload and error data
    const pageData = await request.cache().getPageData() || {}

    // The gotData is data augmented by the handler
    if (getData && typeof getData === 'function') {
      const gotData = await getData(request)
      Object.assign(pageData, { data: gotData })
    }

    return h.view(view, pageData)
  },

  post: async (request, h) => {
    // Store page data in cache for automatic playback and clear any errors
    await request.cache().setPageData({ payload: request.payload })

    // Write data from page into the persistence
    if (setData) {
      await setData(request)
    }

    // Redirect to the next page using the completion function
    if (typeof completion === 'function') {
      return h.redirect(await completion(request))
    } else {
      return h.redirect(completion)
    }
  },

  // On a validation error, set the errors and redirect back to teh GET handler
  error: async (request, h, err) => {
    try {
      await request.cache().setPageData({ payload: request.payload, error: errorShim(err) })
      return h.redirect(request.path).takeover()
    } catch (e) {
      console.error('Unexpected validation error', e)
      return h.redirect('/').takeover()
    }
  }
})
