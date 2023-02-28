import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs, TASKLIST } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { SECTION_TASKS } from '../tasklist/general-sections.js'
import { tagStatus } from '../../services/status-tags.js'

const { SSSI_CHECK } = conservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.CONSERVATION, tagState: tagStatus.COMPLETE })
}

export const completion = async () => TASKLIST.uri

export default pageRoute({
  page: SSSI_CHECK.page,
  uri: SSSI_CHECK.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
