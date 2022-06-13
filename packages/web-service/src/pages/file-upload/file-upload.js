import handler from '../../handlers/page-handler.js'
import { FILE_UPLOAD } from '../../uris.js'

const setData = async request => {
  // Hapi adds filename meta-data...
  // The content is delimited in by the boundary given in the content-type header

  // Payload contains a readable stream....
  request.payload.pipe(process.stdout)
}

const fileUploadPageRoute = (view, path, checkData, getData, completion, setData) => [
  {
    method: 'GET',
    path: path,
    handler: handler(view, checkData, getData).get
  },
  {
    method: 'POST',
    path: path,
    handler: async (request, h) => {
      if (setData) {
        await setData(request)
      }
      if (typeof completion === 'function') {
        return h.redirect(await completion(request))
      } else {
        return h.redirect(completion)
      }
    },
    options: {
      validate: {
        payload: true
      },
      payload: {
        maxBytes: 1048576,
        output: 'stream',
        parse: false,
        multipart: {
          output: 'annotated'
        }
      }
    }
  }
]

export const fileUpload = fileUploadPageRoute(FILE_UPLOAD.page, FILE_UPLOAD.uri, null, null, FILE_UPLOAD.uri, setData)
