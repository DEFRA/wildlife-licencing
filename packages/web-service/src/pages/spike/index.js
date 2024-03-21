import { GenericTextInput, GenericTextPostHandler } from './common/forms/text-input/controller.js'
import { applicantJourney } from './common/config.js'
import { validateRouteRegister } from './common/routes/validateRouteRegister.js'

const createRoutes = () => {
  validateRouteRegister(applicantJourney)
  const arrayOFRoutes = []
  applicantJourney.forEach(config => {
    arrayOFRoutes.push(
      {
        method: 'GET',
        path: config.path,
        handler: (request, h) => {
          return GenericTextInput(config, request, h)
        }
      },
      {
        method: 'POST',
        path: config.path,
        handler: (request, h) => {
          return GenericTextPostHandler(config, request, h)
        }
      }
    )
  })

  console.log('Routes registered: ', arrayOFRoutes.map(route => ({ path: route.path, method: route.method })))
  return arrayOFRoutes
}

export const spikeRouter = [
  ...createRoutes()
]
