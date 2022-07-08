
import {
  SddsApplication,
  SddsApplicationKeys,
  SddsApplicationType,
  SddsApplicationPurpose,
  Contact,
  ContactKeys,
  Account,
  AccountKeys,
  SddsSite,
  SddsSiteKeys
} from '../schema/tables/tables.js'

import { createTableSet, buildRequestPath, buildObjectTransformer, globalOptionSetTransformer } from '../schema/processors/schema-processes.js'
import { powerAppsReadStream } from './powerapps-read-stream.js'

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
const applicationContactsRequestPath = buildRequestPath(SddsApplicationKeys, [ContactKeys])
const applicationContactsTableSet = createTableSet(SddsApplicationKeys, [ContactKeys])
const applicationContactsObjectTransformer = buildObjectTransformer(SddsApplicationKeys, applicationContactsTableSet)
export const applicationContactsReadStream = () => powerAppsReadStream(applicationContactsRequestPath, applicationContactsObjectTransformer)

/* Application accounts */
const applicationAccountsRequestPath = buildRequestPath(SddsApplicationKeys, [AccountKeys])
const applicationAccountsTableSet = createTableSet(SddsApplicationKeys, [AccountKeys])
const applicationAccountsObjectTransformer = buildObjectTransformer(SddsApplicationKeys, applicationAccountsTableSet)
export const applicationAccountsReadStream = () => powerAppsReadStream(applicationAccountsRequestPath, applicationAccountsObjectTransformer)

/* Sites */
const sitesRequestPath = buildRequestPath(SddsSite)
const sitesTableSet = createTableSet(SddsSite)
const sitesObjectTransformer = buildObjectTransformer(SddsSite, sitesTableSet)
export const sitesReadStream = () => powerAppsReadStream(sitesRequestPath, sitesObjectTransformer)

/* Application-sites */
const applicationSiteRequestPath = buildRequestPath(SddsApplicationKeys, [SddsSiteKeys])
const applicationSiteTableSet = createTableSet(SddsApplicationKeys, [SddsSiteKeys])
const applicationSiteObjectTransformer = buildObjectTransformer(SddsApplicationKeys, applicationSiteTableSet)
export const applicationSitesReadStream = () => powerAppsReadStream(applicationSiteRequestPath, applicationSiteObjectTransformer)

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

/* Global option sets */
export const globalOptionSetReadStream = () =>
  powerAppsReadStream('GlobalOptionSetDefinitions', globalOptionSetTransformer)
