import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import db from 'debug'
import { APPLICATION_JSON } from '../../constants.js'
const debug = db('api:submission')

export default async (context, _req, h) => {
  try {
    const { returnId, licenceId } = context.request.params
    const rec = await models.returns.findByPk(returnId)

    // If the licence does not exist return a not found and error
    if (!rec || rec.dataValues.licenceId !== licenceId) {
      return h.response({ code: 404, error: { description: `returnId: ${returnId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    debug(`Received submission for returnId: ${returnId}`)
    const returnQueue = getQueue(queueDefinitions.RETURN_QUEUE)
    const returnJob = await returnQueue.add({ returnId })
    debug(`Queued return ${returnId} - job: ${returnJob.id}`)

    // Add the file upload jobs to the file-queue processor
    const fileQueue = getQueue(queueDefinitions.RETURN_FILE_QUEUE)

    const returnUploads = await models.returnUploads.findAll({
      where: { returnId }
    })

    for await (const upload of returnUploads) {
      const fileJob = await fileQueue.add({ id: upload.dataValues.id, returnId })
      debug(`Queued files for return ${returnId} - job: ${fileJob.id}`)
    }

    await models.returns.update({ userSubmission: SEQUELIZE.getSequelize().fn('NOW') }, { where: { id: returnId } })

    return h.response().code(204)
  } catch (err) {
    console.error('Error updating the RETURNS table', err)
    throw new Error(err.message)
  }
}
