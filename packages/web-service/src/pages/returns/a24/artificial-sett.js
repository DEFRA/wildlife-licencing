import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import pageRoute from '../../../routes/page-route.js'

const { ARTIFICIAL_SETT } = ReturnsURIs.A24

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ARTIFICIAL_SETT.uri
}

export default pageRoute({
  page: ARTIFICIAL_SETT.page,
  uri: ARTIFICIAL_SETT.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
