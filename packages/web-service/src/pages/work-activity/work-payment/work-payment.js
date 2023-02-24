import { APIRequests } from '../../../services/api-requests.js'
import { workActivityURIs } from '../../../uris.js'
import { boolFromYesNo } from '../../common/common.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoPage } from '../../common/yes-no.js'

export const completion = (request, _h) => {
  if (boolFromYesNo(request.payload['yes-no'])) {
    return workActivityURIs.PAYMENT_EXEMPT_REASON.uri
  } else {
    return workActivityURIs.WORK_CATEGORY.uri
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  const newData = Object.assign(applicationData, { exemptFromPayment: boolFromYesNo(request.payload['yes-no']) })
  await APIRequests.APPLICATION.update(applicationId, newData)
}

export default yesNoPage({
  uri: workActivityURIs.PAYING_FOR_LICENCE.uri,
  page: workActivityURIs.PAYING_FOR_LICENCE.page,
  checkData: checkApplication,
  setData,
  completion
})
