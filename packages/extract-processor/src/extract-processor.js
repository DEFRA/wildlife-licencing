import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { createModels } from '@defra/wls-database-model'
import { extractApplications } from '@defra/wls-powerapps-lib'

SEQUELIZE.initialiseConnection().then(() => createModels()).then(async () => {
  await extractApplications()
  console.log('Hello!')
  return Promise.resolve()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
