import { conservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { yesNoFromBool } from '../common/common.js'
import { checkSSSIData } from './common.js'

const { MANAGING_SPECIAL_AREA, NECESSARY_SITE_NAME, SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA } = conservationConsiderationURIs

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const { necessaryToManageSpecialArea } = await APIRequests.APPLICATION.getById(applicationId)
  return { yesNo: yesNoFromBool(necessaryToManageSpecialArea) }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)
  application.necessaryToManageSpecialArea = isYes(request)
  await APIRequests.APPLICATION.update(applicationId, application)
}

export const completion = async request => isYes(request) ? NECESSARY_SITE_NAME.uri : SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA.uri

export const necessaryForManagingSpecialArea = yesNoPage({
  page: MANAGING_SPECIAL_AREA.page,
  uri: MANAGING_SPECIAL_AREA.uri,
  checkData: [checkApplication, checkSSSIData],
  getData: getData,
  completion: completion,
  setData: setData
})
