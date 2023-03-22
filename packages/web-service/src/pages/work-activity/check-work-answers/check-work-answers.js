import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { checkApplication } from '../../common/check-application.js'
import { tagStatus } from '../../../services/status-tags.js'
import { yesNoFromBool } from '../../common/common.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { Backlink } from '../../../handlers/backlink.js'

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
    WATER_SUPPLY_AND_TREATMENT__WATER_ENVIRONMENT
  },
  PAYMENT_EXEMPT_REASON: {
    PRESERVING_PUBLIC_HEALTH_AND_SAFETY,
    PREVENT_DISEASE_SPREAD,
    PREVENT_DAMAGE_TO_LIVESTOCK_CROPS_TIMBER_OR_PROPERTY,
    HOUSEHOLDER_HOME_IMPROVEMENTS,
    SCIENTIFIC_RESEARCH_OR_EDUCATION,
    CONSERVATION_OF_PROTECTED_SPECIES,
    CONSERVATION_OF_A_MONUMENT_OR_BUILDING,
    OTHER
  }
} = PowerPlatformKeys

const paymentExemptReason = {
  [PRESERVING_PUBLIC_HEALTH_AND_SAFETY]: 'Preserving public health and safety',
  [PREVENT_DISEASE_SPREAD]: 'Preventing disease spreading',
  [PREVENT_DAMAGE_TO_LIVESTOCK_CROPS_TIMBER_OR_PROPERTY]: 'Preventing damage to livestock, crops, timber or property',
  [HOUSEHOLDER_HOME_IMPROVEMENTS]: 'Home improvement through householder planning permission or permitted development',
  [SCIENTIFIC_RESEARCH_OR_EDUCATION]: 'Scientific, research or educational purposes',
  [CONSERVATION_OF_PROTECTED_SPECIES]: 'Conservation of protected species, including protection of bat roosts',
  [CONSERVATION_OF_A_MONUMENT_OR_BUILDING]: 'Conserve scheduled monuments, listed buildings, places of worship, or traditional farm buildings',
  [OTHER]: 'Other'
}

const workCategoryText = {
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

  if (applicationData?.exemptFromPayment && applicationData?.paymentExemptReason === OTHER) {
    result.push({ key: 'workPaymentExemptCategory', value: applicationData?.paymentExemptReasonExplanation })
  } else {
    result.push({ key: 'workPaymentExemptCategory', value: paymentExemptReason[applicationData?.paymentExemptReason] })
  }

  result.push({ key: 'workCategory', value: workCategoryText[applicationData?.applicationCategory] })

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
  backlink: Backlink.NO_BACKLINK,
  checkData: checkApplication,
  completion,
  getData
})
