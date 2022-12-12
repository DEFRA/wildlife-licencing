import Joi from 'joi'

export const throwJoiError = (pageName, message, type) => {
  throw new Joi.ValidationError('ValidationError', [{
    message: message,
    path: [pageName],
    type: type,
    context: {
      label: pageName,
      value: 'Error',
      key: pageName
    }
  }], null)
}
