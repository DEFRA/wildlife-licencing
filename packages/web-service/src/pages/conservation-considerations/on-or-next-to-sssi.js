import { conservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { SECTION_TASKS } from '../tasklist/general-sections.js'
import { tagStatus } from '../../services/status-tags.js'
import { yesNoFromBool } from '../common/common.js'

const { SSSI, SSSI_SITE_NAME, SSSI_CHECK } = conservationConsiderationURIs

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.CONSERVATION, tagState: tagStatus.IN_PROGRESS })
  const { onOrNextToDesignatedSite } = await APIRequests.APPLICATION.getById(applicationId)
  return { yesNo: yesNoFromBool(onOrNextToDesignatedSite) }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)
  application.onOrNextToDesignatedSite = isYes(request)
  await APIRequests.APPLICATION.update(applicationId, application)
}

export const completion = async request => isYes(request) ? SSSI_SITE_NAME.uri : SSSI_CHECK.uri

export const onOrNextToSssi = yesNoPage({
  page: SSSI.page,
  uri: SSSI.uri,
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
