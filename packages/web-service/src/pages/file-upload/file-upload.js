import handler from '../../handlers/page-handler.js'
import { FILE_UPLOAD } from '../../uris.js'
import fs from 'fs'
import * as StreamPromises from 'stream/promises'

async function * transformer (source) {
  for await (const chunk of source) {
    const buff = Buffer.from(chunk, 'utf8')

    // This may look a peculiar thing to do to a file we are uploading, but on a form upload, browsers delimit the content with header + footer tags
    // To ensure we match the file (byte for byte) with what the user has uploaded - we need to trim out the delimiters the browser is adding (from the Content-Type header)
    //
    // Each regex has been written to be defensively match, to ensure no genuine content will be removed by it
    // Also operates on every chunk that gets sent to ensure if the headers are sent in 2 seperate chunks - it won't matter
    // As we are running three independent, seperate regexes - it works if one chunk or seven are sent
    //
    // If you need to change this code, the headers that Firefox and Webkit based browsers (Chrome + Edge) delimit with are different, and need to be tested
    // Here are what the 3 different browsers all look like: https://regexr.com/6oj1o
    //
    let result = buff.toString().replace(/------.*[\r\n]+Content-Disposition: form-data; name="file-upload"; filename=".*/m, '')
    result = result.replace(/[\r\n]+Content-Type: .*[\r\n]+/m, '')
    result = result.replace(/------.*[\r\n]+Content-Disposition: form-data; name="continue"[\r\n]+------.*\s+/m, '')
    result = stripFinalNewline(result)

    yield result
  }
}

// Streams output a single newline at the end of the stream
// As we need to match the file byte for byte - need to trim it
const stripFinalNewline = input => {
  const LF = typeof input === 'string' ? '\n' : '\n'.charCodeAt()
  const CR = typeof input === 'string' ? '\r' : '\r'.charCodeAt()

  if (input[input.length - 1] === LF) {
    input = input.slice(0, -1)
  }

  if (input[input.length - 1] === CR) {
    input = input.slice(0, -1)
  }

  return input
}

const setData = async request => {
  // Hapi adds filename meta-data...
  const writeStream = fs.createWriteStream('out.txt', { flags: 'w' })
  await StreamPromises.pipeline(request.payload, transformer, writeStream)
  await request.payload.pipe(writeStream)
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
        maxBytes: 30000000,
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
