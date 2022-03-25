import Joi from 'joi'

export const authJoiObject = Joi.object({
  'user-id': Joi.string().email().required()
}).options({ abortEarly: false, allowUnknown: true })
