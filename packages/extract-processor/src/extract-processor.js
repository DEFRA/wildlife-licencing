import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { createModels } from '@defra/wls-database-model'
import { extractApplications } from '@defra/wls-powerapps-lib'

SEQUELIZE.initialiseConnection()
  .then(() => createModels()
    .then(() => {
      const s = extractApplications()
      s.on('end', () => {
        console.log('Completed reading application extract data data.')
        process.exit(0)
      })
      s.on('data', (chunk) => {
        console.log(JSON.stringify(chunk, null, 2))
      })
    })
  )
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
