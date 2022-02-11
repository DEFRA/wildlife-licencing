import { SddsApplication, Contact, Account, SddsApplicationType, SddsApplicationPurpose } from './model/schema/tables/tables.js'
import { createTableSet, buildRequestPath, buildObjectTransformer } from './model/schema/processors/schema-processes.js'
import { powerAppsReadStream } from './extract/powerapps-read-stream.js'

const requestPath = buildRequestPath(SddsApplication, [Contact, Account, SddsApplicationType, SddsApplicationPurpose])

const tableSet = createTableSet(SddsApplication, [Contact, Account, SddsApplicationType, SddsApplicationPurpose])
const objectTransformer = buildObjectTransformer(SddsApplication, tableSet)

export const applicationReadStream = () => powerAppsReadStream(requestPath, objectTransformer)
