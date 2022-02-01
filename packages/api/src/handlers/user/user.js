import { models } from '@defra/wls-database-model'
import { prepareResponse } from './user-proc.js'
import getEntityByEntityId from '../common/get-entity-by-entity-id.js'
import postUser from './post-user.js'
import deleteUser from './delete-user.js'

const getUserByUserId = () => getEntityByEntityId(
  models.users,
  r => r.params.userId,
  prepareResponse)

export { getUserByUserId, deleteUser, postUser }
