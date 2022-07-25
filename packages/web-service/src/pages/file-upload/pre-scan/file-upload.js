import Joi from 'joi'
import fs from 'fs'
import path from 'path'
import handler, { errorShim } from '../../../handlers/page-handler.js'
import { CHECK_YOUR_ANSWERS, FILE_UPLOAD } from '../../../uris.js'
import { scanFile } from '../../../services/virus-scan.js'
import { MAX_FILE_UPLOAD_SIZE_MB, TIMEOUT_MS } from '../../../constants.js'

export const setData = async (request) => {
  const currentFilePlusDirectory = path.join(process.env.SCANDIR, path.basename(request.payload['scan-file'].path))

  // We need to take a filename like: hello.txt
  // And rename it to something like: {unixTimestamp}.{originalFileName}
  // So if the user uploads it to us, but doesn't submit it fully all the way to s3 - we can check the timestamp and delete it
  // It also stops collisions if multiple users all upload files with the same name
  const newFilename = (+new Date()) + '.' + request.payload['scan-file'].filename
  const newFilenamePlusDirectory = path.join(process.env.SCANDIR, newFilename)

  fs.renameSync(currentFilePlusDirectory, newFilenamePlusDirectory, (err) => {
    if (err) {
      console.err(err)
    }
  })

  const virusPresent = await scanFile(newFilenamePlusDirectory)
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

export const completion = async (request) => {
  const journeyData = await request.cache().getPageData() || {}
  if (journeyData.error) {
    return FILE_UPLOAD.uri
  } else {
    const currentCache = await request.cache().getPageData() || {}
    const addToCache = { filename: request.payload['scan-file'].filename }
    await request.cache().setData(Object.assign(currentCache, addToCache))
    return CHECK_YOUR_ANSWERS.uri
  }
}

export const validator = async payload => {
  const throwError = (err) => { throw err }

  // The user hasn't attached a file in their request
  if (payload['scan-file'].bytes === 0 && payload['scan-file'].filename === '') {
    // Hapi generates a has for a filename, and still attempts to store what the user has sent (an empty file)
    // In this instance, we need to wipe the temporary file and throw a joi error
    fs.unlinkSync(payload['scan-file'].path, err => {
      if (err) {
        throwError(err)
      }
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

  if (payload['scan-file'].bytes >= MAX_FILE_UPLOAD_SIZE_MB) {
    fs.unlinkSync(payload['scan-file'].path, err => {
      throwError(err)
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

const fileUploadPageRoute = (view, fileUploadPath, checkData, getData, fileUploadValidator, fileUploadCompletion, fileUploadSetData) => [
  {
    method: 'GET',
    path: fileUploadPath,
    handler: handler(view, checkData, getData).get
  },
  {
    method: 'POST',
    path: fileUploadPath,
    handler: async (request, h) => {
      if (fileUploadSetData) {
        await fileUploadSetData(request)
      }
      if (typeof fileUploadCompletion === 'function') {
        return h.redirect(await fileUploadCompletion(request))
      } else {
        return h.redirect(fileUploadCompletion)
      }
    },
    options: {
      validate: {
        payload: fileUploadValidator,
        failAction: handler().error
      },
      plugins: {
        disinfect: false
      },
      payload: {
        // maxBytes defaults to one megabyte (which we need to be bigger)
        // But we also need to catch the error and raise a joi error (rather than let hapi catch it)
        // Allow hapi to load MAX_FILE_UPLOAD_SIZE_MB + 1Mb
        maxBytes: (MAX_FILE_UPLOAD_SIZE_MB + 1) * 1024 * 1024,
        uploads: process.env.SCANDIR,
        multipart: {
          output: 'file'
        },
        parse: true,
        timeout: TIMEOUT_MS
      }
    }
  }
]

export const fileUpload = fileUploadPageRoute(FILE_UPLOAD.page, FILE_UPLOAD.uri, null, null, validator, completion, setData)
