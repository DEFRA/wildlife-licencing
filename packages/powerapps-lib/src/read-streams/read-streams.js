import {
  SddsApplication,
  SddsApplicationType,
  SddsApplicationPurpose,
  Contact,
  Account,
  SddsSite,
  SddsLicensableActions,
  SddsEcologistExperience,
  SddsLicenseActivities,
  SddsLicenseMethods,
  SddsSpecies,
  SddsSpeciesSubject,
  SddsLicence,
  columnSourceRemote
} from '../schema/tables/tables.js'

import { createTableSet, buildRequestPath, buildObjectTransformer, globalOptionSetTransformer } from '../schema/processors/schema-processes.js'
import { powerAppsReadStream } from './powerapps-read-stream.js'
import { Table } from '../schema/schema.js'

// Just the relations and the filter to indicate it was created by the service
const SddsApplicationRelations = Table.relations(SddsApplication).addColumn(columnSourceRemote)

/* Licences */
const licenceRequestPath = buildRequestPath(SddsLicence, [SddsApplicationRelations])
const licenceTableSet = createTableSet(SddsLicence, [SddsApplicationRelations])
const licenceObjectTransformer = buildObjectTransformer(SddsLicence, licenceTableSet)
export const licenceReadStream = () => powerAppsReadStream(licenceRequestPath, licenceObjectTransformer)

/* Applications */
const applicationRequestPath = buildRequestPath(SddsApplication, [SddsApplicationType, SddsApplicationPurpose])
const applicationTableSet = createTableSet(SddsApplication, [SddsApplicationType, SddsApplicationPurpose])
const applicationObjectTransformer = buildObjectTransformer(SddsApplication, applicationTableSet)
export const applicationReadStream = () => powerAppsReadStream(applicationRequestPath, applicationObjectTransformer)

/* Contacts */
const contactsRequestPath = buildRequestPath(Contact)
const contactsTableSet = createTableSet(Contact)
const contactsObjectTransformer = buildObjectTransformer(Contact, contactsTableSet)
export const contactsReadStream = () => powerAppsReadStream(contactsRequestPath, contactsObjectTransformer)

/* Account */
const accountsRequestPath = buildRequestPath(Account)
const accountsTableSet = createTableSet(Account)
const accountsObjectTransformer = buildObjectTransformer(Account, accountsTableSet)
export const accountsReadStream = () => powerAppsReadStream(accountsRequestPath, accountsObjectTransformer)

/* Application contacts */
const applicationContactsRequestPath = buildRequestPath(SddsApplicationRelations, [Contact])
const applicationContactsTableSet = createTableSet(SddsApplicationRelations, [Contact])
const applicationContactsObjectTransformer = buildObjectTransformer(SddsApplicationRelations, applicationContactsTableSet)
export const applicationContactsReadStream = () => powerAppsReadStream(applicationContactsRequestPath, applicationContactsObjectTransformer)

/* Application accounts */
const applicationAccountsRequestPath = buildRequestPath(SddsApplicationRelations, [Account])
const applicationAccountsTableSet = createTableSet(SddsApplicationRelations, [Account])
const applicationAccountsObjectTransformer = buildObjectTransformer(SddsApplicationRelations, applicationAccountsTableSet)
export const applicationAccountsReadStream = () => powerAppsReadStream(applicationAccountsRequestPath, applicationAccountsObjectTransformer)

/* Sites */
const sitesRequestPath = buildRequestPath(SddsSite)
const sitesTableSet = createTableSet(SddsSite)
const sitesObjectTransformer = buildObjectTransformer(SddsSite, sitesTableSet)
export const sitesReadStream = () => powerAppsReadStream(sitesRequestPath, sitesObjectTransformer)

/* Application-sites */
const applicationSiteRequestPath = buildRequestPath(SddsApplicationRelations, [SddsSite])
const applicationSiteTableSet = createTableSet(SddsApplicationRelations, [SddsSite])
const applicationSiteObjectTransformer = buildObjectTransformer(SddsApplicationRelations, applicationSiteTableSet)
export const applicationSitesReadStream = () => powerAppsReadStream(applicationSiteRequestPath, applicationSiteObjectTransformer)

/* Licensable actions */
const licensableActionsRequestPath = buildRequestPath(SddsLicensableActions, [SddsApplicationRelations, SddsLicenseActivities, SddsSpecies, SddsSpeciesSubject])
const licensableActionsTableSet = createTableSet(SddsLicensableActions, [SddsApplicationRelations, SddsLicenseActivities, SddsSpecies, SddsSpeciesSubject])
const licensableActionsObjectTransformer = buildObjectTransformer(SddsLicensableActions, licensableActionsTableSet)
export const licensableActionsReadStream = () => powerAppsReadStream(licensableActionsRequestPath, licensableActionsObjectTransformer)

/* Previous Licences (part of ecologist experience) */
const previousLicencesRequestPath = buildRequestPath(SddsEcologistExperience, [SddsApplicationRelations])
const previousLicencesPathTableSet = createTableSet(SddsEcologistExperience, [SddsApplicationRelations])
const previousLicencesObjectTransformer = buildObjectTransformer(SddsEcologistExperience, previousLicencesPathTableSet)
export const previousLicencesReadStream = () => powerAppsReadStream(previousLicencesRequestPath, previousLicencesObjectTransformer)

/* Application Types */
const applicationTypesRequestPath = buildRequestPath(SddsApplicationType)
const applicationTypesTableSet = createTableSet(SddsApplicationType)
const applicationTypesObjectTransformer = buildObjectTransformer(SddsApplicationType, applicationTypesTableSet)
export const applicationTypesReadStream = () => powerAppsReadStream(applicationTypesRequestPath, applicationTypesObjectTransformer)

/* Application Purposes */
const applicationPurposesRequestPath = buildRequestPath(SddsApplicationPurpose)
const applicationPurposesTableSet = createTableSet(SddsApplicationPurpose)
const applicationPurposesObjectTransformer = buildObjectTransformer(SddsApplicationPurpose, applicationPurposesTableSet)
export const applicationPurposesReadStream = () => powerAppsReadStream(applicationPurposesRequestPath, applicationPurposesObjectTransformer)

/* Activities */
const activitiesRequestPath = buildRequestPath(SddsLicenseActivities)
const activitiesTableSet = createTableSet(SddsLicenseActivities)
const activitiesObjectTransformer = buildObjectTransformer(SddsLicenseActivities, activitiesTableSet)
export const activitiesReadStream = () => powerAppsReadStream(activitiesRequestPath, activitiesObjectTransformer)

/* Methods */
const methodsRequestPath = buildRequestPath(SddsLicenseMethods)
const methodsTableSet = createTableSet(SddsLicenseMethods)
const methodsObjectTransformer = buildObjectTransformer(SddsLicenseMethods, methodsTableSet)
export const methodsReadStream = () => powerAppsReadStream(methodsRequestPath, methodsObjectTransformer)

/* Species */
const speciesRequestPath = buildRequestPath(SddsSpecies, [SddsSpeciesSubject])
const speciesTableSet = createTableSet(SddsSpecies, [SddsSpeciesSubject])
const speciesObjectTransformer = buildObjectTransformer(SddsSpecies, speciesTableSet)
export const speciesReadStream = () => powerAppsReadStream(speciesRequestPath, speciesObjectTransformer)

/* Species Subject */
const speciesSubjectRequestPath = buildRequestPath(SddsSpeciesSubject)
const speciesSubjectTableSet = createTableSet(SddsSpeciesSubject)
const speciesSubjectObjectTransformer = buildObjectTransformer(SddsSpeciesSubject, speciesSubjectTableSet)
export const speciesSubjectReadStream = () => powerAppsReadStream(speciesSubjectRequestPath, speciesSubjectObjectTransformer)

/* Activity-Method */
const SddsLicenseActivitiesRelations = Table.relations(SddsLicenseActivities)
const activityMethodsRequestPath = buildRequestPath(SddsLicenseActivitiesRelations, [SddsLicenseMethods])
const activityMethodsTableSet = createTableSet(SddsLicenseActivitiesRelations, [SddsLicenseMethods])
const activityMethodsObjectTransformer = buildObjectTransformer(SddsLicenseActivitiesRelations, activityMethodsTableSet)
export const activityMethodsReadStream = () => powerAppsReadStream(activityMethodsRequestPath, activityMethodsObjectTransformer)

/* Application Type-Activities */
const SddsApplicationTypeRelations = Table.relations(SddsApplicationType)
const applicationTypeActivitiesRequestPath = buildRequestPath(SddsApplicationTypeRelations, [SddsLicenseActivities])
const applicationTypeActivitiesTableSet = createTableSet(SddsApplicationTypeRelations, [SddsLicenseActivities])
const applicationTypeActivitiesObjectTransformer = buildObjectTransformer(SddsApplicationTypeRelations, applicationTypeActivitiesTableSet)
export const applicationTypeActivitiesReadStream = () => powerAppsReadStream(applicationTypeActivitiesRequestPath, applicationTypeActivitiesObjectTransformer)

/* Application Type-Species */
const applicationTypeSpeciesRequestPath = buildRequestPath(SddsApplicationTypeRelations, [SddsSpecies])
const applicationTypeSpeciesTableSet = createTableSet(SddsApplicationTypeRelations, [SddsSpecies])
const applicationTypeSpeciesObjectTransformer = buildObjectTransformer(SddsApplicationTypeRelations, applicationTypeSpeciesTableSet)
export const applicationTypeSpeciesReadStream = () => powerAppsReadStream(applicationTypeSpeciesRequestPath, applicationTypeSpeciesObjectTransformer)

/* Application Type-Purposes */
const applicationTypeApplicationPurposesRequestPath = buildRequestPath(SddsApplicationTypeRelations, [SddsApplicationPurpose])
const applicationTypeApplicationPurposesTableSet = createTableSet(SddsApplicationTypeRelations, [SddsApplicationPurpose])
const applicationTypeApplicationPurposesObjectTransformer = buildObjectTransformer(SddsApplicationTypeRelations, applicationTypeApplicationPurposesTableSet)
export const applicationTypeApplicationPurposesReadStream = () =>
  powerAppsReadStream(applicationTypeApplicationPurposesRequestPath, applicationTypeApplicationPurposesObjectTransformer)

/* Global option sets */
export const globalOptionSetReadStream = () =>
  powerAppsReadStream('GlobalOptionSetDefinitions', globalOptionSetTransformer)
