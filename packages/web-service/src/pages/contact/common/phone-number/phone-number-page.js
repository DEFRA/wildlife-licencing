import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

export const getValidator = () => async (payload) => {
  Joi.assert({
    'phone-number': payload['phone-number']
  }, Joi.object({
    'phone-number': Joi.string().regex(/^[^*$%]+$/).required()
  }))
}

export const phoneNumberPage = ({ page, uri, checkData, getData, completion, setData }) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: getValidator()
  })
