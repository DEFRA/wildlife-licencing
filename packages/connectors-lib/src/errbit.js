import { Notifier } from '@airbrake/node'
import Config from './config.js'
export const ERRBIT = {
  initialize: () => {
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
        airbrake.notify(args).then()
      }
    }
  }
}
