import { REDIS, SEQUELIZE } from '@defra/wls-connectors-lib'
import { createModels } from '@defra/wls-database-model'
import {
  applicationReadStream, sitesReadStream, applicationSitesReadStream,
  contactsReadStream
} from '@defra/wls-powerapps-lib'
import { databaseWriter } from './database-writer.js'
import { writeApplicationObject } from './write-application-object.js'
import { writeSiteObject } from './write-site-object.js'
import { writeApplicationSiteObject } from './write-application-site-object.js'
import { writeContactObject } from './write-contact-object.js'

const extracts = async () => {
  await databaseWriter(applicationReadStream(), writeApplicationObject, new Date(), 'Applications')
  await databaseWriter(sitesReadStream(), writeSiteObject, new Date(), 'Sites')
  await databaseWriter(applicationSitesReadStream(), writeApplicationSiteObject, new Date(), 'Application-Sites')
  await databaseWriter(contactsReadStream(), writeContactObject, new Date(), 'Contacts')
}

Promise.all([
  REDIS.initialiseConnection(),
  SEQUELIZE.initialiseConnection()
]).then(() =>
  createModels()
    .then(() => extracts()
      .then(() => {
        console.log('Extracts complete')
        process.exit(0)
      })
    ))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
