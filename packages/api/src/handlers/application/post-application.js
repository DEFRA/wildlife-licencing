import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { dataValues } = await models.applications.create({
      id: uuidv4(),
      application: req.payload,
      updateStatus: 'L'
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/application/${dataValues.id}`, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
