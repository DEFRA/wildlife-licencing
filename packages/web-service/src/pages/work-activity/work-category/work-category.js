import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'

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
  }
} = PowerPlatformKeys

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationCategory = await APIRequests.APPLICATION.getById(applicationId)?.applicationCategory || 0

  return {
    applicationCategory,
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
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  const newData = Object.assign(applicationData, { applicationCategory: parseInt(request.payload[workActivityURIs.WORK_CATEGORY.page]) })
  await APIRequests.APPLICATION.update(applicationId, newData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData?.applicationId).get(SECTION_TASKS.WORK_ACTIVITY)
  if (isCompleteOrConfirmed(tagState)) {
    return workActivityURIs.CHECK_YOUR_ANSWERS.uri
  } else {
    return workActivityURIs.LICENCE_COST.uri
  }
}

export default pageRoute({
  uri: workActivityURIs.WORK_CATEGORY.uri,
  page: workActivityURIs.WORK_CATEGORY.page,
  checkData: checkApplication,
  completion,
  validator: Joi.object({
    'work-category': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  getData
})
