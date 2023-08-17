import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse, alwaysExclude } from './account-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    const { dataValues } = await models.accounts.create({
      id: uuidv4(),
      account: alwaysExclude(req.payload),
      updateStatus: 'L',
      ...(req.payload.cloneOf && { cloneOf: req.payload.cloneOf })
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/account/${dataValues.id}`, responseBody)
    return h.response(responseBody).type(APPLICATION_JSON).code(201)
  } catch (err) {
    console.error('Error inserting into ACCOUNTS table', err)
    throw new Error(err.message)
  }
}
