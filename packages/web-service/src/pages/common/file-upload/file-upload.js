import Joi from 'joi'
import fs from 'fs'
import handler from '../../../handlers/page-handler.js'
import { FILE_UPLOAD_HEADROOM_BYTES, MAX_FILE_UPLOAD_SIZE_BYTES } from '../../../constants.js'
import { scanFile } from '../../../services/virus-scan.js'

export const SHAPE_FILES = ['CPG', 'DBF', 'PRJ', 'SBN', 'SBX', 'SHP', 'SHP.XML', 'SHX']

console.log(`File upload maxsize ${MAX_FILE_UPLOAD_SIZE_BYTES} bytes`)
console.log(`File upload headroom ${FILE_UPLOAD_HEADROOM_BYTES} bytes`)

export const FILETYPES = {
  SUPPORTING_INFORMATION: {
    filetype: 'METHOD-STATEMENT',
    multiple: true,
    supportedFileTypes: ['ZIP', 'JPG', 'PNG', 'TIF', 'BMP', 'GEOJSON', 'KML', 'DOC', 'DOCX', 'PDF', 'ODT', 'XLS', 'XLSX', 'ODS', ...SHAPE_FILES]
  },
  SITE_MAP_FILES: {
    filetype: 'MAP',
    multiple: true,
    supportedFileTypes: ['ZIP', 'JPG', 'PNG', 'GEOJSON', 'KML', 'PDF', ...SHAPE_FILES]
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
  if (fileType === FILETYPES.SUPPORTING_INFORMATION.filetype) {
    return !!FILETYPES.SUPPORTING_INFORMATION.supportedFileTypes.find(t => file.filename.toUpperCase().endsWith(t))
  } else if (fileType === FILETYPES.SITE_MAP_FILES.filetype) {
    return !!FILETYPES.SITE_MAP_FILES.supportedFileTypes.find(t => file.filename.toUpperCase().endsWith(t))
  }
  return false
}

export const validator = async (payload, fileType) => {
  // The user hasn't attached a file in their request
  if (payload['scan-file'].filename === '') {
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

  if (parseInt(payload['scan-file'].bytes) === 0) {
    fs.unlinkSync(payload['scan-file'].path)
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: empty file has been uploaded',
      path: ['scan-file'],
      type: 'empty-file-chosen',
      context: {
        label: 'scan-file',
        value: 'Error',
        key: 'scan-file'
      }
    }], null)
  }

  if (parseInt(payload['scan-file'].bytes) >= MAX_FILE_UPLOAD_SIZE_BYTES) {
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
 * Note on the timeouts. The payload timeout does not work, it is always 10 secs.
 * It can be set to false in which case the default is 10s suspended. If applied to the server then
 * it gives a service unavailable response, but this bypasses
 * (breaks) the error handling. For now set to false and rely on the filesize limit to prevent process hogging
 */
export const fileUploadPageRoute = ({ view, checkData, fileUploadUri, getData, fileUploadCompletion, fileType }) => [
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
        payload: payload => validator(payload, fileType),
        failAction: handler().error
      },
      plugins: {
        disinfect: true
      },
      payload: {
        // maxBytes defaults to one megabyte (which we need to be bigger)
        // But we also need to catch the error and raise a joi error (rather than let hapi catch it)
        // Allow hapi to load MAX_FILE_UPLOAD_SIZE_BYTES + FILE_UPLOAD_HEADROOM_BYTES
        maxBytes: MAX_FILE_UPLOAD_SIZE_BYTES + FILE_UPLOAD_HEADROOM_BYTES,
        uploads: process.env.SCANDIR,
        multipart: {
          output: 'file'
        },
        parse: true,
        timeout: false
      }
    }
  }
]
