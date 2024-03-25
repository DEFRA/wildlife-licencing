import pageRoute from '../../routes/page-route.js'
import { ERRORS } from '../../uris.js'

export const getData = async request => {
  const includeHomeLink = request.query.includeHomeLink

  return { includeHomeLink }
}

export default pageRoute({
  page: ERRORS.NOT_FOUND.page,
  uri: ERRORS.NOT_FOUND.uri,
  getData: getData
})
