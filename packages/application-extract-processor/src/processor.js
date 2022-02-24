import { REDIS, SEQUELIZE } from '@defra/wls-connectors-lib'
import { createModels } from '@defra/wls-database-model'
import { applicationReadStream, sitesReadStream, applicationSitesReadStream } from '@defra/wls-powerapps-lib'
import { databaseWriter } from './database-writer.js'
import { writeApplicationObject } from './write-application-object.js'
import { writeSiteObject } from './write-site-object.js'
import { writeApplicationSiteObject } from './write-application-site-object.js'

Promise.all([
  REDIS.initialiseConnection(),
  SEQUELIZE.initialiseConnection()
]).then(() => createModels()
  .then(() => databaseWriter(applicationReadStream(), writeApplicationObject, new Date(), 'Applications')
    .then(() => databaseWriter(sitesReadStream(), writeSiteObject, new Date(), 'Sites'))
    .then(() => databaseWriter(applicationSitesReadStream(), writeApplicationSiteObject, new Date(), 'Application-Sites'))
    .then(() => {
      console.log('Extracts completed')
      process.exit(0)
    }))
).catch(e => {
  console.error(e)
  process.exit(1)
})
