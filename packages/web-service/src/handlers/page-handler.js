import Joi from 'joi'
import { Backlink } from './backlink.js'
import querystring from 'querystring'

export const errorShim = e => e.details.reduce((a, c) => ({ ...a, [c.path[0]]: c.type }), {})

const doCheckData = async (checkData, request, h) => {
  // Check data is a function
  if (checkData && typeof checkData === 'function') {
    const check = await checkData(request, h)
    if (check) {
      return check
    }
  } else if (checkData && Array.isArray(checkData)) {
    // Check data is an array of function
    for await (const checkFunc of checkData) {
      const check = await checkFunc(request, h)
      if (check) {
        return check
      }
    }
  }

  return null
}

export const getPageData = async request => {
  if (request.info.referrer.length) {
    const referrer = new URL(request.info.referrer)
    if (referrer?.pathname !== request.path) {
      await request.cache().clearPageData()
      return {}
    }
  }
  return await request.cache().getPageData() || {}
}

export default (view, checkData, getData, completion, setData, backlink = Backlink.JAVASCRIPT) => ({
  get: async (request, h) => {
    const check = await doCheckData(checkData, request, h)
    if (check) {
      return check
    }

    // Page data is automatically handled payload and error data
    const pageData = await getPageData(request)

    // The gotData is data augmented by the handler
    if (getData && typeof getData === 'function') {
      const gotData = await getData(request)
      Object.assign(pageData, { data: gotData })
    }

    // Add the backlink data
    Object.assign(pageData, { backlink: await backlink.get(request) })

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
    if (err instanceof Joi.ValidationError) {

      const errorList = []
      err.details.forEach(error => {
        errorList.push(  {
          text: error.message,
          href: "#" + error.path[0],
          id: error.path[0]
        })
      })

      await request.cache().setPageData({ payload: request.payload, error: errorShim(err), errorList })
      // Take account of any query string in the redirect
      const qs = querystring.stringify(request.query)
      return h.redirect(request.path + (qs.length > 0 ? ('?' + qs) : '')).takeover()
    } else {
      // If error is anything other than a validation exception then rethrow it
      throw err
    }
  }
})
