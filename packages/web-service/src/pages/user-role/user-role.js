import pageRoute from '../../routes/page-route.js'
import { USER_ROLE } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

export const setData = async request => {
  const journeyData = await request.cache().getData()
  journeyData.applicationRole = request.payload['user-role']
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: USER_ROLE.page,
  uri: USER_ROLE.uri,
  completion: USER_ROLE.uri,
  checkData: checkApplication,
  setData: setData,
  options: { auth: { mode: 'optional' } }
})
