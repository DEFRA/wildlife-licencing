import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { createModels } from '@defra/wls-database-model'
import { applicationTypesReadStream, applicationPurposesReadStream } from '@defra/wls-powerapps-lib'
import { databaseWriter } from './database-writer.js'
import { writeApplicationTypes, writeApplicationPurposes } from './write-object.js'

SEQUELIZE.initialiseConnection()
  .then(() => createModels()
    .then(() => Promise.all([
      databaseWriter(applicationTypesReadStream(), writeApplicationTypes, 'Application Types'),
      databaseWriter(applicationPurposesReadStream(), writeApplicationPurposes, 'Application Purposes')
    ]).then(() => {
      console.log('Reference data extracts completed')
      process.exit(0)
    })))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
