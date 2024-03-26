import Joi from 'joi'

export const validateTextInput = (data, config) => {
  const validationSchema = Joi.object({
    [config.id]: Joi.string().required().messages({
      'any.required': 'Enter a name',
      'string.empty': 'Enter a name'
    })
  })

  const validationResult = validationSchema.validate(data)

  if (validationResult.error) {
    const errors = validationResult.error.details.map((error) => ({
      text: error.message,
      href: '#' + config.id
    }))
    return { valid: false, errors, errorMessage: errors[0] }
  }

  return { valid: true }
}
