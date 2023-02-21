import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs } from '../../../uris.js'

export const completion = (request, _h) => {
  if (request.payload['yes-no'] === 'yes') {
    return workActivityURIs.PAYMENT_EXEMPT_REASON.uri
  } else {
    return workActivityURIs.WORK_CATEGORY.uri
  }
}

export default pageRoute({
  uri: workActivityURIs.PAYING_FOR_LICENCE.uri,
  page: workActivityURIs.PAYING_FOR_LICENCE.page,
  completion
})
