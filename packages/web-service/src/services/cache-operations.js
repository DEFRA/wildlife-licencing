import * as top from '../uris.js'

const findPages = (obj, pages = []) => {
  Object.keys(obj).forEach(key => {
    if (obj[key].page) {
      pages.push(obj[key].page)
    } else {
      findPages(obj[key], pages)
    }
  })
  return pages
}

// Search the uri's recursively for all the pages
const PAGES = findPages(top)

/**
 * Clears the page data when a new application is chosen
 * @param request
 * @returns {Promise<Awaited<*>[]>}
 */
export const clearPageData = async request => Promise.all(PAGES.map(async p => request.cache().clearPageData(p)))

/**
 * Clears the data from the "top-level" when a new application is chosen
 * @param request
 * @returns {Promise<Awaited<*>[]>}
 */
export const clearData = async request => {
  const journeyData = await request.cache().getData()
  delete journeyData.habitatData
  await request.cache().setData(journeyData)
}
