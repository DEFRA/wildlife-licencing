import { APIRequests } from '../../../../services/api-requests.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'
const nameReg = /^[/\s\p{L}'-.,]{1,160}$/u

export const getValidator = contactType => async (payload, context) => {
  const cd = cacheDirect(context)
  const { userId } = await cd.getData()
  const contacts = await APIRequests.CONTACT.role(contactType).findByUser(userId)
  const names = contacts.map(c => c.fullName).filter(c => c)
  Joi.assert({ name: payload.name }, Joi.object({
    // Remove double spacing
    name: Joi.string().trim().replace(/((\s+){2,})/gm, '$2')
      .pattern(nameReg).invalid(...names).insensitive().required()
  }), 'name', { abortEarly: false, allowUnknown: true })
}

export const contactNamePage = ({ page, uri, checkData, getData, completion, setData }, contactRole) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: getValidator(contactRole)
  })
