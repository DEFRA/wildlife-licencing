import { APPLICATIONS, HEALTH, REMOVE_FILE_UPLOAD } from '../uris.js'
import createApplication from '../handlers/create-application.js'
import removeUpload from '../handlers/remove-uploaded-file.js'

import path from 'path'
import { __dirname } from '../../dirname.cjs'
import { APIRequests } from '../services/api-requests.js'

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
    handler: async (_request, h) => h.redirect(APPLICATIONS.uri),
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
      return h.response(response).code(200).type('application/json')
    }
  })
}

export default miscRoutes
