import pageRoute from '../../routes/page-route.js'
import { FEEDBACK } from '../../uris.js'

export const getData = async request => {
  return {
  }
}

export const completion = async request => {
  // TODO - Navigate to feedback confirmation page
  return ''
}

export const validator = async (payload, context) => {
  // TODO - Add validation code
}

export default pageRoute({
  page: FEEDBACK.page,
  uri: FEEDBACK.uri,
  validator,
  completion,
  getData
})
