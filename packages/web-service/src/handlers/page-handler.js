/**
 * @param path - the path attached to the handler
 * @param view - the name of the view template
 * @param completion - redirect to on successful completion
 * @param getData - This function is used to preload the page with any data required to populate
 * @returns {{post: (function(*, *): ResponseObject | * | Response), get: (function(*, *): *), error: (function(*, *, *=): ResponseObject)}}
 */
export default (path, view, completion, getData) => ({
  /**
   * Generic get handler for pages
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  get: async (request, h) => {
    let page
    // console.log(request)
    // // try catch to find out what is causing "Cannot read property 'view' of undefined"
    // try {
    //   page = await request.cache().helpers.page.getCurrentPermission(view)
    // } catch (err) {
    //   const pageCache = await request.cache().helpers.page.get()
    //   debug(`Page cache - ${JSON.stringify(pageCache)}`)

    //   const statusCache = await request.cache().helpers.status.get()
    //   debug(`Status cache - ${JSON.stringify(statusCache)}`)

    //   const transactionCache = await request.cache().helpers.transaction.get()
    //   debug(`Transaction cache - ${JSON.stringify(transactionCache)}`)

    //   throw err
    // }

    const pageData = page || {}

    // The page data payload may be enriched by the data fetched by getData
    if (getData && typeof getData === 'function') {
      try {
        const data = await getData(request)
        Object.assign(pageData, { data })
      } catch (err) {
        // If GetDataRedirect is thrown the getData function is requesting a redirect
        if (err instanceof GetDataRedirect) {
          return h.redirect(err.redirectUrl)
        }

        throw err
      }
    }

    // It is necessary then using the back buttons and other indirect navigations to clear any errors
    // from abandoned pages
    // await clearErrorsFromOtherPages(request, view)

    // // Calculate the back reference and add to page
    // pageData.mssgs = request.i18n.getCatalog()
    // pageData.altLang = request.i18n.getLocales().filter(locale => locale !== request.i18n.getLocale())
    // pageData.backRef = await getBackReference(request, view)
    return h.view(view, pageData)
  },
  /**
   * Generic post handler for pages
   * @param request
   * @param h
   * @returns {Promise<*|Response>}
   */
  post: async (request, h) => {
    await request.cache().helpers.page.setCurrentPermission(view, { payload: request.payload })
    const status = await request.cache().helpers.status.getCurrentPermission()
    status.currentPage = view
    status[view] = PAGE_STATE.completed
    await request.cache().helpers.status.setCurrentPermission(status)

    if (typeof completion === 'function') {
      return h.redirect(await completion(request))
    } else {
      return h.redirect(completion)
    }
  },
  /**
   * Generic error handler for pages
   * @param request
   * @param h
   * @param err
   * @returns {Promise}
   */
  error: async (request, h, err) => {
    try {
      await request.cache().helpers.page.setCurrentPermission(view, { payload: request.payload, error: errorShimm(err) })
      await request.cache().helpers.status.setCurrentPermission({ [view]: PAGE_STATE.error, currentPage: view })
      return h.redirect(request.path).takeover()
    } catch (err2) {
      // Need a catch here if the user has posted an invalid response with no cookie
      if (err2 instanceof CacheError) {
        return h.redirect(CONTROLLER.uri).takeover()
      }

      throw err2
    }
  }
})
