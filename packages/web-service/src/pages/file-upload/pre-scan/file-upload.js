import handler from '../../../handlers/page-handler.js'
import { CHECK_YOUR_ANSWERS, FILE_UPLOAD } from '../../../uris.js'
import { scanFile } from '../../../services/virus-scan.js'
import Joi from 'joi'
import fs from 'fs'

const setData = async (request) => {
  const currentFileName = process.env.SCANNING_DIR + '/' + request.payload['file-upload'].path.split('\\').pop()

  // We need to take a filename like: hello.txt
  // And rename it to something like: {unixTimestamp}.{originalFileName}
  // So if the user uploads it to us, but doesn't submit it fully all the way to s3 - we can check the timestamp and delete it
  // It also stops collisions if multiple users all upload files with the same name
  const newFileName = process.env.SCANNING_DIR + '/' + (+new Date()) + '.' + request.payload['file-upload'].filename

  fs.renameSync(currentFileName, newFileName, (err) => {
    if (err) { console.err(err) }
  })

  const virusPresent = await scanFile(newFileName)
  await request.cache().setPageData({ virusPresent })
}

const completion = async (request) => {
  const { virusPresent } = await request.cache().getPageData()

  if (virusPresent) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Unauthorized: email address not found',
      path: ['scan-file'],
      type: 'unauthorized',
      context: {
        label: 'scan-file',
        value: 'I dont get this but I think I need it',
        key: 'scan-file'
      }
    }], null)
  } else {
    return CHECK_YOUR_ANSWERS.uri
  }
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
        uploads: process.env.SCANNING_DIR,
        multipart: {
          output: 'file'
        },
        parse: true,
        timeout: 10000
      }
    }
  }
]

export const fileUpload = fileUploadPageRoute(FILE_UPLOAD.page, FILE_UPLOAD.uri, null, null, completion, setData)
