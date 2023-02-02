import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import Joi from 'joi'

export const getData = async () => ({
  authorities: await APIRequests.OTHER.authorities(),
  selected: { id: '1f64da5a-4276-ed11-81ad-0022481b5bf5' } // The pre-selected item
})

export const validator = async payload => {
  const id = payload.authorityId || payload.fbAuthorityId
  const ids = (await APIRequests.OTHER.authorities()).map(a => a.id)
  Joi.assert({ id }, Joi.object({
    id: Joi.string().required().valid(...ids)
  }).options({ abortEarly: false, allowUnknown: true }))
}

export const setData = async request => {
  const { payload } = request
  const id = payload.authorityId || payload.fbAuthorityId
  const authorities = await APIRequests.OTHER.authorities()
  console.log(authorities.find(a => a.id === id)?.name)
}

export default pageRoute({
  uri: '/authority',
  page: 'authority',
  getData: getData,
  validator: validator,
  setData: setData,
  completion: '/authority'
})
