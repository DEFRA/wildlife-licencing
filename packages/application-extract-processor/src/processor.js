import { ERRBIT, SEQUELIZE } from '@defra/wls-connectors-lib'
import db from 'debug'
import fs from 'fs'

import {
  applicationReadStream, sitesReadStream, applicationSitesReadStream,
  contactsReadStream, accountsReadStream, applicationContactsReadStream,
  applicationAccountsReadStream, licensableActionsReadStream, planningConsentsReadStream,
  licenceReadStream, returnReadStream, previousLicencesReadStream, applicationDesignatedSitesReadStream
} from '@defra/wls-powerapps-lib'

import { createModels } from '@defra/wls-database-model'
import { databaseWriter } from './database-writer.js'
import { writeApplicationObject } from './write-application-object.js'
import { writeSiteObject } from './write-site-object.js'
import { writeApplicationSiteObject } from './write-application-site-object.js'
import { writeContactObject } from './write-contact-object.js'
import { writeAccountObject } from './write-account-object.js'
import { writeApplicationAccountObject } from './write-application-account-object.js'
import { writeApplicationContactObject } from './write-application-contact-object.js'
import { writeHabitatSiteObject } from './write-habitat-site-object.js'
import { writeLicenceObject } from './write-licence-object.js'
import { writeReturnObject } from './write-return-object.js'
import { writePreviousLicenceObject } from './write-previous-licence-object.js'
import { writePermissionsObject } from './write-permissions-object.js'
import { writeApplicationDesignatedSiteObject } from './write-application-designated-site-object.js'

const extracts = async () => {
  await databaseWriter(sitesReadStream(), writeSiteObject, new Date(), 'Sites')
  await databaseWriter(applicationDesignatedSitesReadStream(), writeApplicationDesignatedSiteObject, new Date(), 'Designated Sites')
  await databaseWriter(contactsReadStream(), writeContactObject, new Date(), 'Contacts')
  await databaseWriter(accountsReadStream(), writeAccountObject, new Date(), 'Accounts')
  await databaseWriter(applicationReadStream(), writeApplicationObject, new Date(), 'Applications')
  await databaseWriter(applicationContactsReadStream(), writeApplicationContactObject, new Date(), 'Application-Contacts')
  await databaseWriter(applicationAccountsReadStream(), writeApplicationAccountObject, new Date(), 'Application-Accounts')
  await databaseWriter(applicationSitesReadStream(), writeApplicationSiteObject, new Date(), 'Application-Sites')
  await databaseWriter(licenceReadStream(), writeLicenceObject, new Date(), 'licences')
  await databaseWriter(licensableActionsReadStream(), writeHabitatSiteObject, new Date(), 'Licensable-Actions')
  await databaseWriter(planningConsentsReadStream(), writePermissionsObject, new Date(), 'permissions')
  await databaseWriter(returnReadStream(), writeReturnObject, new Date(), 'returns')
  await databaseWriter(previousLicencesReadStream(), writePreviousLicenceObject, new Date(), 'previous-licences')
}

const proc = async () => {
  await SEQUELIZE.initialiseConnection()
  await createModels()
  await extracts()
}

// Warning -- may print sensitive info. Ensure disabled in production
const debug = db('application-extract-processor:env')
debug(`Environment: ${JSON.stringify(process.env, null, 4)}`)

const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)
ERRBIT.initialize('Application extract processor')

proc()
  .then(() => {
    console.log('Extracts complete')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
