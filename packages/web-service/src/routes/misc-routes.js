import { HEALTH, REMOVE_FILE_UPLOAD, SPECIES } from '../uris.js'
import createApplication from '../handlers/create-application.js'
import removeUpload from '../handlers/remove-uploaded-file.js'
import { setGlobalDate, unsetGlobalDate } from '../common/fake-date.js'

import path from 'path'
import { __dirname } from '../../dirname.cjs'
import { APIRequests } from '../services/api-requests.js'

const APPLICATION_JSON = 'application/json'

const miscRoutes = [
  {
    method: 'GET',
    path: HEALTH.uri,
    handler: async (_request, h) => h.response('healthy!').code(200),
    options: { auth: false }
  },
  {
    method: 'GET',
    path: '/',
    handler: async (_request, h) => h.redirect(SPECIES.uri),
    options: { auth: false }
  },
  {
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, 'public')
      }
    },
    options: { auth: false }
  },
  {
    method: 'GET',
    path: '/application/create',
    handler: createApplication
  },
  {
    method: 'GET',
    path: REMOVE_FILE_UPLOAD.uri,
    handler: removeUpload
  }
]

if (process.env.ALLOW_RESET === 'YES') {
  miscRoutes.push({
    method: 'GET',
    path: '/reset',
    options: { auth: false },
    handler: async (request, h) => {
      const response = await APIRequests.OTHER.reset(request.query?.username)
      return h.response(response).code(200).type(APPLICATION_JSON)
    }
  })

  /**
   * Time travel handlers http://localhost:4000/set-sysdate?iso-string=2022-10-05T17:48:00.000Z
   */
  miscRoutes.push({
    method: 'GET',
    path: '/set-sysdate',
    options: { auth: false },
    handler: async (request, h) => {
      const { 'iso-string': isoString } = request.query
      setGlobalDate(isoString)
      return h.response({ now: Date() }).code(200).type(APPLICATION_JSON)
    }
  })

  miscRoutes.push({
    method: 'GET',
    path: '/reset-sysdate',
    options: { auth: false },
    handler: async (_request, h) => {
      unsetGlobalDate()
      return h.response({ now: Date() }).code(200).type(APPLICATION_JSON)
    }
  })
}

export default miscRoutes
