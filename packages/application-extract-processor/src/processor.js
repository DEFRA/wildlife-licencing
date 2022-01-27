import { REDIS, SEQUELIZE } from '@defra/wls-connectors-lib'
import { createModels } from '@defra/wls-database-model'
import { applicationReadStream } from '@defra/wls-powerapps-lib'
import { applicationsDatabaseWriter } from './applications-database-writer.js'

Promise.all([
  REDIS.initialiseConnection(),
  SEQUELIZE.initialiseConnection()
]).then(() => createModels()
  .then(() => applicationsDatabaseWriter(applicationReadStream(), new Date())
    .then(() => {
      console.log('Application extract completed')
      process.exit(0)
    })))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
