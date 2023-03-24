import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { DEFAULT_ROLE } from '../../constants'
import { APIRequests } from '../../services/api-requests'
import { APPLICATIONS } from '../../uris'

const { BACKEND_STATUS, APPLICATION_TYPES } = PowerPlatformKeys

export const findLastSentEvent = licence => (licence.annotations &&
  licence.annotations.filter(a => a.objectTypeCode === 'sdds_license' && a.mimetype === 'application/pdf')
    .sort((a, b) => Date(a.modifiedOn) > Date(b.modifiedOn))[0]) || null

export const checkData = async (request, h) => {
  const params = new URLSearchParams(request.query)
  if (!params.get('applicationId')) {
    return h.redirect(APPLICATIONS.uri)
  }

  const applicationId = params.get('applicationId')
  const { userId } = await request.cache().getData()
  const roles = await APIRequests.APPLICATION.findRoles(userId, applicationId)
  if (!roles?.includes(DEFAULT_ROLE)) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

// values to keys and keys to values
export const statuses = Object.entries(BACKEND_STATUS)
  .map(([k, v]) => ({ [v]: k }))
  .reduce((p, c) => ({ ...p, ...c }))

export const findApplicationType = application => Object.entries(APPLICATION_TYPES)
  .find(([_k, v]) => v === application.applicationTypeId)[0]

export const getApplicationData = async request => {
  const params = new URLSearchParams(request.query)
  const applicationId = params.get('applicationId')
  const journeyData = await request.cache().getData()
  await request.cache().setData(Object.assign(journeyData, { applicationId }))
  const application = await APIRequests.APPLICATION.getById(applicationId)
  const applicationType = findApplicationType(application)

  return { application, applicationType, applicationId }
}