import { eligibilityURIs, NSIP, WINDOW_NOT_OPEN } from '../../uris.js'
import { yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { LicenceTypeConstants } from '../../common/licence-type-constants.js'
import { inDateWindow } from '../../common/date-utils.js'
import { boolFromYesNo } from '../common/common.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)
  return { yesNo: application?.nationallySignificantInfrastructure }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)
  Object.assign(application, { nationallySignificantInfrastructure: boolFromYesNo(request.payload['yes-no']) })
  await APIRequests.APPLICATION.update(applicationId, application)
}

export const completion = async request => {
  // Displays a message in the closed season and a month before if not an NSIP
  const { applicationId } = await request.cache().getData()
  const { applicationTypeId } = await APIRequests.APPLICATION.getById(applicationId)
  const { WARNING_PAGE_START, WARNING_PAGE_END } = LicenceTypeConstants[applicationTypeId]
  if (inDateWindow(new Date(), WARNING_PAGE_START, WARNING_PAGE_END) && !boolFromYesNo(request.payload['yes-no'])) {
    return WINDOW_NOT_OPEN.uri
  }

  return eligibilityURIs.LANDOWNER.uri
}

export default yesNoPage({
  page: NSIP.page,
  uri: NSIP.uri,
  checkData: checkApplication,
  getData: getData,
  setData: setData,
  completion: completion,
  options: { auth: { mode: 'optional' } }
})
