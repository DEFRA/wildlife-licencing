import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { prepareResponse } from '../reference-data/reference-data.js'
const { cache } = REDIS

// Use the types cache
const TYPES_CACHE = 'application/types'

export default async (_context, req, h) => {
  try {
    const { applicationType } = req.query
    let response
    const cached = await cache.restore(TYPES_CACHE)
    const today = new Date()
    const year = today.getFullYear()

    if (!cached) {
      const r = await models.applicationTypes.findAll()
      response = r.map(t => prepareResponse(t.dataValues))
      if (response.length) {
        await cache.save(TYPES_CACHE, response)
      }
    } else {
      response = JSON.parse(cached)
    }

    // Return not found if no application-type set
    if (!response.length) {
      return h.response().code(404)
    }

    const suffix = response.find(r => applicationType.toUpperCase() === r.name.toUpperCase())?.refNoSuffix

    if (!suffix) {
      return h.response().code(404)
    }

    const res = await models.getApplicationRef()
    const counter = res[0].nextval
    const ref = `${year}-${counter}-${suffix}`
    return h.response({ ref })
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error fetching application-reference', err)
    throw new Error(err.message)
  }
}
