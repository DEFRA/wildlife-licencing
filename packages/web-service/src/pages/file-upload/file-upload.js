import handler from '../../handlers/page-handler.js'
import { FILE_UPLOAD } from '../../uris.js'
import fs from 'fs'

const setData = (request) => {
  const currentFileName = process.env.SCAN_DIR + '/' + request.payload['file-upload'].path.split('\\').pop()
  const newFileName = process.env.SCAN_DIR + '/' + request.payload['file-upload'].filename

  fs.rename(currentFileName, newFileName, (err) => {
    if (err) console.log('ERROR: ' + err)
  })
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
      plugins: {
        // Disinfect disabled on this route as caused an issue with the payload code below.
        // Note that while the payload isn't being sanitised no text boxes allowing user input should be used on this page.
        disinfect: false
      },
      payload: {
        maxBytes: process.env.MAX_FILE_UPLOAD * 1_000_000,
        uploads: 'tmp',
        multipart: {
          output: 'file'
        },
        parse: true,
        timeout: 10000
      }
    }
  }
]

export const fileUpload = fileUploadPageRoute(FILE_UPLOAD.page, FILE_UPLOAD.uri, null, null, FILE_UPLOAD.uri, setData)
