import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './site-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    const { dataValues } = await models.sites.create({
      id: uuidv4(),
      site: req.payload,
      updateStatus: 'L'
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/site/${dataValues.id}`, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into SITES table', err)
    throw new Error(err.message)
  }
}
