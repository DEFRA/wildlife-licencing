import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse, alwaysExclude } from './contact-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    const contactObj = alwaysExclude(req.payload)

    const { dataValues } = await models.contacts.create({
      id: uuidv4(),
      contact: contactObj,
      updateStatus: 'L',
      ...(req.payload.userId && { userId: req.payload.userId }),
      ...(req.payload.cloneOf && { cloneOf: req.payload.cloneOf })
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/contact/${dataValues.id}`, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into CONTACTS table', err)
    throw new Error(err.message)
  }
}
