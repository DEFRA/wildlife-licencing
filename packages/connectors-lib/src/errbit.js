import { Notifier } from '@airbrake/node'
import Config from './config.js'
export const ERRBIT = {
  initialize: serviceName => {
    if (Config.errbit.environment) {
      const error = console.error
      const airbrake = new Notifier({
        host: Config.errbit.host,
        projectId: parseInt(Config.errbit.projectId),
        projectKey: Config.errbit.projectKey,
        environment: Config.errbit.environment
      })
      console.error = function (...args) {
        error.apply(console, args)
        const err = args.find(a => a instanceof Error)
        airbrake.notify({
          error: err,
          message: args,
          context: { component: serviceName }
        }).then().catch(e => {
          console.log(e)
        })
      }
    }
  }
}
