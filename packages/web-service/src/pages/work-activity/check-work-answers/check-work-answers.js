import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { checkApplication } from '../../common/check-application.js'
import { tagStatus } from '../../../services/status-tags.js'
import { yesNoFromBool } from '../../common/common.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

const {
  APPLICATION_CATEGORY: {
    BARN_CONVERSION,
    COMMERCIAL,
    COMMUNICATIONS,
    ENERGY_GENERATION__ENERGY_SUPPLY,
    FLOOD_AND_COASTAL_DEFENCES,
    HOUSING__NON_HOUSEHOLDER,
    INDUSTRIAL__MANUFACTURING,
    MINERAL_EXTRACTION__QUARRYING,
    NATIONALLY_SIGNIFICANT_INFRASTRUCTURE_PROJECTS,
    PUBLIC_BUILDINGS_AND_LAND,
    TOURISM__LEISURE,
    TRANSPORT__HIGHWAYS,
    WASTE_MANAGEMENT,
    WATER_SUPPLY_AND_TREATMENT__WATER_ENVIRONMENT,

    REGISTERED_PLACES_OF_WORSHIP,
    SCHEDULED_MONUMENTS,
    LISTED_BUILDINGS,
    TRADITIONAL_FARM_BUILDINGS_IN_A_COUNTRYSIDE_STEWARDSHIP_AGREEMENT,
    HOUSEHOLDER_HOME_IMPROVEMENTS,
    OTHER
  }
} = PowerPlatformKeys

const workCategoryText = {
  [REGISTERED_PLACES_OF_WORSHIP]: 'Registered places of worship',
  [SCHEDULED_MONUMENTS]: 'Scheduled monuments',
  [LISTED_BUILDINGS]: 'Listed buildings',
  [TRADITIONAL_FARM_BUILDINGS_IN_A_COUNTRYSIDE_STEWARDSHIP_AGREEMENT]: 'Traditional farm buildings in a countryside stewardship agreement',
  [HOUSEHOLDER_HOME_IMPROVEMENTS]: 'Homes being improved through householder planning permission or permitted development',
  [OTHER]: 'Other'
}

const paymentExemptReason = {
  [BARN_CONVERSION]: 'Barn conversion',
  [COMMERCIAL]: 'Commercial',
  [COMMUNICATIONS]: 'Communications',
  [ENERGY_GENERATION__ENERGY_SUPPLY]: 'Energy generation and supply',
  [FLOOD_AND_COASTAL_DEFENCES]: 'Flood and coastal defences',
  [HOUSING__NON_HOUSEHOLDER]: 'Residential housing (not householder improvements)',
  [INDUSTRIAL__MANUFACTURING]: 'Industrial or manufacturing',
  [MINERAL_EXTRACTION__QUARRYING]: 'Quarrying and mining',
  [NATIONALLY_SIGNIFICANT_INFRASTRUCTURE_PROJECTS]: 'Nationally significant infrastructure projects',
  [PUBLIC_BUILDINGS_AND_LAND]: 'Public buildings and public land',
  [TOURISM__LEISURE]: 'Tourism and leisure',
  [TRANSPORT__HIGHWAYS]: 'Transport, including roads',
  [WASTE_MANAGEMENT]: 'Waste management',
  [WATER_SUPPLY_AND_TREATMENT__WATER_ENVIRONMENT]: 'Water bodies, water supply and treatment'
}

export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  if (!applicationData?.proposalDescription || !applicationData?.exemptFromPayment || !applicationData?.applicationCategory) {
    return h.redirect(TASKLIST.uri)
  }

  return null
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.WORK_ACTIVITY, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  const result = []

  result.push({ key: 'workProposal', value: applicationData.proposalDescription })
  result.push({ key: 'workPayment', value: yesNoFromBool(applicationData?.exemptFromPayment) })

  const applicationText = workCategoryText[applicationData?.applicationCategory]
  if (applicationText !== undefined) {
    result.push({ key: 'workCategory', value: applicationText })
  } else {
    result.push({ key: 'workPaymentExemptCategory', value: paymentExemptReason[applicationData?.applicationCategory] })
  }

  if (applicationData?.exemptFromPayment && applicationData?.applicationCategory === OTHER) {
    result.push({ key: 'workPaymentExemptReason', value: applicationData?.paymentExemptReason })
  }

  return result
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.WORK_ACTIVITY, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

export default pageRoute({
  uri: workActivityURIs.CHECK_YOUR_ANSWERS.uri,
  page: workActivityURIs.CHECK_YOUR_ANSWERS.page,
  checkData: checkApplication,
  completion,
  getData
})
