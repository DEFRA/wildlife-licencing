import Joi from 'joi'
import fs from 'fs'
import path from 'path'
import Boom from '@hapi/boom'
import handler, { errorShim } from '../../../handlers/page-handler.js'
import { MAX_FILE_UPLOAD_SIZE_MB, TIMEOUT_MS } from '../../../constants.js'
import { scanFile } from '../../../services/virus-scan.js'
import { APPLICATIONS } from '../../../uris.js'

export const FILETYPES = {
  METHOD_STATEMENT: 'method-statement'
}

export const setData = async request => {
  const { filename } = request.payload['scan-file']
  const currentFilePath = path.join(process.env.SCANDIR, path.basename(request.payload['scan-file'].path))
  // We need to take a filename like: hello.txt
  // And rename it to something like: {unixTimestamp}.{originalFileName}
  // So if the user uploads it to us, but doesn't submit it fully all the way to s3 - we can check the timestamp and delete it
  // It also stops collisions if multiple users all upload files with the same name
  const journeyData = await request.cache().getData()
  const newFilename = `${+new Date()}.${journeyData.applicationId}.${filename}`
  const newFilenamePath = path.join(process.env.SCANDIR, newFilename)
  request.cache().setData(Object.assign(journeyData, {
    fileUpload: {
      filepath: newFilenamePath, filename
    }
  }))

  fs.renameSync(currentFilePath, newFilenamePath, err => {
    console.error('file can\'t be renamed to include unix-timestamp', err)
    Boom.boomify(err, { statusCode: 500 })
    throw err
  })

  const virusPresent = await scanFile(newFilenamePath)
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

export const validator = async payload => {
  // The user hasn't attached a file in their request
  if (payload['scan-file'].bytes === 0 && payload['scan-file'].filename === '') {
    // Hapi generates a has for a filename, and still attempts to store what the user has sent (an empty file)
    // In this instance, we need to wipe the temporary file and throw a joi error
    fs.unlinkSync(payload['scan-file'].path)
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
    fs.unlinkSync(payload['scan-file'].path)
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

/**
 * Must have selected an application to upload a file
 * @param request
 * @param h
 * @returns {Promise<null|*>}
 */
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }
  return null
}

export const fileUploadPageRoute = ({ view, fileUploadUri, getData, fileUploadCompletion }) => [
  {
    method: 'GET',
    path: fileUploadUri,
    handler: handler(view, checkData, getData).get
  },
  {
    method: 'POST',
    path: fileUploadUri,
    handler: async (request, h) => {
      await setData(request)
      if (typeof fileUploadCompletion === 'function') {
        return h.redirect(await fileUploadCompletion(request))
      } else {
        return h.redirect(fileUploadCompletion)
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
