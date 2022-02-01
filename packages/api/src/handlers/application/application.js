import { models } from '@defra/wls-database-model'
import postApplication from './post-application.js'
import putApplication from './put-application.js'
import { prepareResponse } from './application-proc.js'
import getEntityByEntityId from '../common/get-entity-by-entity-id.js'
import getApplicationsByUserId from './get-applications-by-user-id.js'
import deleteApplication from './delete-application.js'
import postApplicationSubmit from './post-application-submit.js'

const getApplicationByApplicationId = () => getEntityByEntityId(
  models.applications,
  r => r.params.applicationId,
  prepareResponse)

export {
  postApplication,
  putApplication,
  getApplicationsByUserId,
  getApplicationByApplicationId,
  deleteApplication,
  postApplicationSubmit
}
