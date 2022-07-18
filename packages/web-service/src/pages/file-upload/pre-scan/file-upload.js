import handler, { errorShim } from '../../../handlers/page-handler.js'
import { CHECK_YOUR_ANSWERS, FILE_UPLOAD } from '../../../uris.js'
import { scanFile } from '../../../services/virus-scan.js'
import Joi from 'joi'
import fs from 'fs'

const setData = async (request) => {
  const currentFilePlusDirectory = process.env.SCANNING_DIR + '/' + request.payload['scan-file'].path.split('\\').pop()

  // We need to take a filename like: hello.txt
  // And rename it to something like: {unixTimestamp}.{originalFileName}
  // So if the user uploads it to us, but doesn't submit it fully all the way to s3 - we can check the timestamp and delete it
  // It also stops collisions if multiple users all upload files with the same name
  const newFilename = (+new Date()) + '.' + request.payload['scan-file'].filename
  const newFilenamePlusDirectory = process.env.SCANNING_DIR + '/' + newFilename

  fs.renameSync(currentFilePlusDirectory, newFilenamePlusDirectory, (err) => {
    if (err) { console.err(err) }
  })

  const virusPresent = await scanFile(newFilename)
  if (virusPresent) {
    await request.cache().setPageData({
      payload: request.payload,
      error: errorShim(new Joi.ValidationError('ValidationError', [{
        message: 'Error: the file contains a virus',
        path: ['scan-file'],
        type: 'infected',
        context: {
          label: 'scan-file',
          value: 'Error',
          key: 'scan-file'
        }
      }]))
    })
  }
}

const completion = async (request) => {
  const journeyData = await request.cache().getPageData() || {}
  if (journeyData.error) {
    return FILE_UPLOAD.uri
  } else {
    await request.cache().setData(Object.assign(await request.cache().getPageData() || {}, { filename: request.payload['scan-file'].filename }))
    return CHECK_YOUR_ANSWERS.uri
  }
}

export const validator = async payload => {
  // The user hasn't attached a file in their request
  if (payload['scan-file'].bytes === 0 && payload['scan-file'].filename === '') {
    // Hapi generates a has for a filename, and still attempts to store what the user has sent (an empty file)
    // In this instance, we need to wipe the temporary file and throw a joi error
    fs.unlinkSync(payload['scan-file'].path, err => {
      if (err) throw err
    })

    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no file has been uploaded',
      path: ['scan-file'],
      type: 'no-file-chosen',
      context: {
        label: 'scan-file',
        value: 'Error',
        key: 'scan-file'
      }
    }], null)
  }

  if (payload['scan-file'].bytes >= 30_000_000) {
    fs.unlinkSync(payload['scan-file'].path, err => {
      if (err) throw err
    })

    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: the file was too large',
      path: ['scan-file'],
      type: 'file-too-big',
      context: {
        label: 'scan-file',
        value: 'Error',
        key: 'scan-file'
      }
    }], null)
  }
}

const fileUploadPageRoute = (view, path, checkData, getData, validator, completion, setData) => [
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
        payload: validator,
        failAction: handler().error
      },
      plugins: {
        disinfect: false
      },
      payload: {
        // maxBytes defaults to one megabyte (which we need to be bigger)
        // But we also need to catch the error and raise a joi error (rather than let hapi catch it)
        // So for files 30 - 40mb - we'll raise a joi error
        // For files 40mb and above - we won't even accept the file, we'll just redirect the user to an error page inside `client-error.njk`
        maxBytes: (process.env.MAX_FILE_UPLOAD * 1_333_334),
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

export const fileUpload = fileUploadPageRoute(FILE_UPLOAD.page, FILE_UPLOAD.uri, null, null, validator, completion, setData)
