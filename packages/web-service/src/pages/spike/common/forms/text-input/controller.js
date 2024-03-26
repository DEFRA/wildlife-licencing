import { validateTextInput } from './vaidation.js'

export const GenericTextInput = async (config, request, h) => {
  await config.get()
  return h.view('spike.njk', {
    title: config.name,
    id: config.id,
    value: ''
  })
}

export const GenericTextPostHandler = async (config, request, h) => {
  const validationResult = validateTextInput(request.payload, config)
  if (!validationResult.valid) {
    return h.view('spike.njk', {
      title: config.name,
      id: config.id,
      value: request.payload[config.id],
      errorList: validationResult.errors,
      errorMessage: validationResult.errorMessage
    })
  }
  await config.save()
  return h.redirect(config.journey.next)
  // handle validation -
  // doSuccess() - store in db etc
  //   redirect -
}
