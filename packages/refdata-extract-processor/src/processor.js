import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { createModels } from '@defra/wls-database-model'
import {
  applicationTypesReadStream,
  applicationPurposesReadStream,
  activitiesReadStream,
  methodsReadStream,
  speciesReadStream,
  speciesSubjectReadStream,
  globalOptionSetReadStream,
  activityMethodsReadStream,
  applicationTypeActivitiesReadStream,
  applicationTypeSpeciesReadStream,
  applicationTypeApplicationPurposesReadStream,
  authoritiesReadStream
} from '@defra/wls-powerapps-lib'
import { databaseWriter } from './database-writer.js'

import {
  writeApplicationTypes, writeApplicationPurposes,
  writeActivities, writeMethods, writeSpecies, writeSpeciesSubject, writeActivityMethods,
  writeApplicationTypeActivities, writeApplicationTypeSpecies,
  writeApplicationApplicationPurpose, writeOptionSets,
  writeAuthorities
} from './write-object.js'
import fs from 'fs'

const extracts = async () => {
  await databaseWriter(applicationTypesReadStream(), writeApplicationTypes, 'Application Types')
  await databaseWriter(applicationPurposesReadStream(), writeApplicationPurposes, 'Application Purposes')
  await databaseWriter(activitiesReadStream(), writeActivities, 'Activities')
  await databaseWriter(methodsReadStream(), writeMethods, 'Methods')
  await databaseWriter(speciesSubjectReadStream(), writeSpeciesSubject, 'Species-Subject')
  await databaseWriter(speciesReadStream(), writeSpecies, 'Species') // Has FK to species subject
  await databaseWriter(activityMethodsReadStream(), writeActivityMethods, 'Activity-Methods')
  await databaseWriter(applicationTypeActivitiesReadStream(), writeApplicationTypeActivities, 'Application type Activities')
  await databaseWriter(applicationTypeSpeciesReadStream(), writeApplicationTypeSpecies, 'Application type Species')
  await databaseWriter(applicationTypeApplicationPurposesReadStream(), writeApplicationApplicationPurpose, 'Application type Application Purposes')
  await databaseWriter(authoritiesReadStream(), writeAuthorities, 'Authorities')

  await databaseWriter(globalOptionSetReadStream(), writeOptionSets, 'Option sets')
}

const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)

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
