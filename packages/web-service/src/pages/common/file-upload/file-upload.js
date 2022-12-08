import Joi from 'joi'
import fs from 'fs'
import handler from '../../../handlers/page-handler.js'
import { MAX_FILE_UPLOAD_SIZE_MB, TIMEOUT_MS } from '../../../constants.js'
import { scanFile } from '../../../services/virus-scan.js'
import { checkApplication } from '../check-application.js'

export const FILETYPES = {
  SUPPORTING_INFORMATION: {
    filetype: 'METHOD-STATEMENT',
    multiple: true,
    supportedFileTypes: ['JPG', 'PNG', 'TIF', 'BMP', 'GEOJSON', 'KML', 'SHAPE', 'DOC', 'DOCX', 'PDF', 'ODT', 'XLS', 'XLSX', 'ODS']
  },
  SITE_MAP_FILES: {
    filetype: 'MAP',
    multiple: true,
    supportedFileTypes: ['JPG', 'PNG', 'GEOJSON', 'KML', 'SHAPE', 'PDF']
  }
}

export const setData = async request => {
  const { filename, path } = request.payload['scan-file']
  const journeyData = await request.cache().getData()
  await request.cache().setData(Object.assign(journeyData, {
    fileUpload: {
      filename, path
    }
  }))
}

export const getFileExtension = (file, fileType) => {
  const fileExtension = file.filename.split('.').reverse()[0]?.toUpperCase()

  if (fileType === FILETYPES.SUPPORTING_INFORMATION.filetype) {
    return FILETYPES.SUPPORTING_INFORMATION.supportedFileTypes.indexOf(fileExtension) >= 0
  } else if (fileType === FILETYPES.SITE_MAP_FILES.filetype) {
    return FILETYPES.SITE_MAP_FILES.supportedFileTypes.indexOf(fileExtension) >= 0
  }
  return false
}

export const validator = async (payload, fileType) => {
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

  const isFileExtensionSupported = getFileExtension(payload['scan-file'], fileType)

  if (!isFileExtensionSupported) {
    fs.unlinkSync(payload['scan-file'].path)
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: The selected file must be a JPG, BMP, PNG, TIF, KML, Shape, DOC, DOCX, ODT, XLS, XLSX, GeoJSON, ODS or PDF',
      path: ['scan-file'],
      type: 'wrong-file-type',
      context: {
        label: 'scan-file',
        value: 'Error',
        key: 'scan-file'
      }
    }], null)
  }

  const isFileInfected = await scanFile(payload['scan-file'].path)

  if (isFileInfected) {
    fs.unlinkSync(payload['scan-file'].path)
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: the file contains a virus',
      path: ['scan-file'],
      type: 'infected',
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
export const fileUploadPageRoute = ({ view, fileUploadUri, getData, fileUploadCompletion, fileType }) => [
  {
    method: 'GET',
    path: fileUploadUri,
    handler: handler(view, checkApplication, getData).get
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
        payload: payload => validator(payload, fileType),
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
