import { Notifier } from '@airbrake/node'
import Config from './config.js'
import db from 'debug'
import util from 'util'
const debug = db('connectors-lib:errbit')

export const ERRBIT = {
  initialize: serviceName => {
    const errbitConfig = {
      host: Config.errbit.host,
      projectId: parseInt(Config.errbit.projectId),
      projectKey: Config.errbit.projectKey,
      environment: Config.errbit.environment,
      errorNotifications: true
    }
    debug(errbitConfig)
    if (Config.errbit.environment && Config.errbit.environment !== 'mute') {
      const error = console.error
      // airbrake = new Notifier(errbitConfig)
      console.error = function (...args) {
        // const err = args.find(a => a instanceof Error)
        const airbrake = new Notifier(errbitConfig)
        error.apply(console, args)
        airbrake.notify({
          error: util.format(...args),
          context: { component: serviceName }
        }).catch(e => console.log(e))
      }
    }
  }
}
