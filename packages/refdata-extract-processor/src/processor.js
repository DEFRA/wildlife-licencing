import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { createModels } from '@defra/wls-database-model'
import {
  applicationTypesReadStream,
  applicationPurposesReadStream,
  activitiesReadStream,
  methodsReadStream,
  globalOptionSetReadStream,
  activityMethodsReadStream,
  applicationTypeActivitiesReadStream
} from '@defra/wls-powerapps-lib'
import { databaseWriter } from './database-writer.js'

import {
  writeApplicationTypes, writeApplicationPurposes,
  writeActivities, writeMethods, writeActivityMethods,
  writeApplicationTypeActivities, writeOptionSets
} from './write-object.js'

const extracts = async () => {
  await databaseWriter(applicationTypesReadStream(), writeApplicationTypes, 'Application Types')
  await databaseWriter(applicationPurposesReadStream(), writeApplicationPurposes, 'Application Purposes')
  await databaseWriter(activitiesReadStream(), writeActivities, 'Activities')
  await databaseWriter(methodsReadStream(), writeMethods, 'Methods')
  await databaseWriter(activityMethodsReadStream(), writeActivityMethods, 'Activity-Methods')
  await databaseWriter(applicationTypeActivitiesReadStream(), writeApplicationTypeActivities, 'Application type Activities')
  await databaseWriter(globalOptionSetReadStream(), writeOptionSets, 'Option sets')
}

SEQUELIZE.initialiseConnection()
  .then(() => createModels()
    .then(() => extracts().then(() => {
      console.log('Reference data extracts completed')
      process.exit(0)
    })))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
