import HapiVision from '@hapi/vision'
import HapiInert from '@hapi/inert'
import Crumb from '@hapi/crumb'
import Disinfect from 'disinfect'

export const plugins = [HapiVision, HapiInert, {
  plugin: Crumb,
  options: {
    logUnauthorized: true,
    cookieOptions: {
      isSecure: process.env.NODE_ENV !== 'development',
      isHttpOnly: process.env.NODE_ENV !== 'development'
    }
  }
}, {
  plugin: Disinfect,
  options: {
    disinfectQuery: true,
    disinfectParams: true,
    disinfectPayload: true
  }
}]
