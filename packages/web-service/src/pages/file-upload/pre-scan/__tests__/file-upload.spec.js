import fs from 'fs'
import path from 'path'
import { MAX_FILE_UPLOAD_SIZE_MB } from '../../../../constants.js'
import { CHECK_YOUR_ANSWERS, FILE_UPLOAD } from '../../../../uris.js'

describe('the file-upload page handler', () => {
  beforeEach(() => jest.resetModules())
  it('if the user doesnt attach a file - then it causes a joi error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: 0, filename: '', path: 'scandir/' } }
    try {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve() })
      }))
      const { validator } = await import('../file-upload.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: no file has been uploaded')
    }
  })

  it('a file thats too big causes a joi error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: 32_000_0000, filename: 'ok.txt', path: 'scandir/' } }
    try {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve() })
      }))
      const { validator } = await import('../file-upload.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: the file was too large')
    }
  })

  it('a file thats is not too big, causes no error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: MAX_FILE_UPLOAD_SIZE_MB - 100, filename: 'ok.txt', path: 'scandir/' } }
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))

    const { validator } = await import('../file-upload.js')
    expect(async () => await validator(payload)).not.toThrow()
  })

  it('a file that contains a virus causes a joi error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())
    jest.spyOn(path, 'join').mockImplementation(() => 'hello.txt')
    jest.spyOn(fs, 'renameSync').mockImplementation(() => jest.fn())

    jest.doMock('../../../../services/virus-scan.js', () => ({
      scanFile: () => {
        return true
      }
    }))

    let data = {}
    const request = {
      payload: {
        'scan-file':
         { path: 'scandir/' }
      },
      cache: () => (
        {
          getPageData: () => { return data },
          setPageData: (newData) => { data = newData }
        }
      )
    }

    const errorObject = {
      error: {
        'scan-file': 'infected'
      },
      payload: {
        'scan-file': {
          path: 'scandir/'
        }
      }
    }

    const { setData } = await import('../file-upload.js')
    await setData(request)
    expect(request.cache().getPageData()).toStrictEqual(errorObject)
  })

  it('a file that has no error, redirects to check-your-answers', async () => {
    const request = {
      payload: {
        'scan-file': {
          filename: 'eicar.txt'
        }
      },
      cache: () => (
        {
          getPageData: () => { return {} },
          setData: jest.fn()
        }
      )
    }
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const { completion } = await import('../file-upload.js')
    expect(await completion(request)).toBe(CHECK_YOUR_ANSWERS.uri)
  })

  it('a file that has errors, redirects to file-upload uri', async () => {
    const request = {
      cache: () => (
        {
          getPageData: () => { return { error: true } }
        }
      )
    }
    const { completion } = await import('../file-upload.js')
    expect(await completion(request)).toBe(FILE_UPLOAD.uri)
  })

  it('the handler function calls completion and setData once', async () => {
    const h = {
      redirect: () => {}
    }
    const mockSetData = jest.fn()
    const mockCompletion = jest.fn()

    const { fileUploadPageRoute } = await import('../file-upload.js')
    const arr = fileUploadPageRoute(null, '/path', null, null, null, mockCompletion, mockSetData)
    await arr[1].handler({}, h)
    expect(mockSetData).toHaveBeenCalledTimes(1)
    expect(mockCompletion).toHaveBeenCalledTimes(1)
  })

  it('the handler function calls completion and setData once - and also redirects', async () => {
    const redirect = jest.fn()
    const h = {
      redirect
    }
    const mockSetData = jest.fn()
    const mockCompletion = jest.fn()

    const { fileUploadPageRoute } = await import('../file-upload.js')
    const arr = fileUploadPageRoute(null, '/path', null, null, null, mockCompletion, mockSetData)
    await arr[1].handler({}, h)
    expect(mockSetData).toHaveBeenCalledTimes(1)
    expect(mockCompletion).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledTimes(1)
  })

  it('if you dont pass setdata - validator is still called', async () => {
    const h = {
      redirect: () => {}
    }
    const mockCompletion = jest.fn()

    const { fileUploadPageRoute } = await import('../file-upload.js')
    const arr = fileUploadPageRoute(null, '/path', null, null, null, mockCompletion)
    await arr[1].handler({}, h)
    expect(mockCompletion).toHaveBeenCalledTimes(1)
  })

  it('if you dont pass validator - setdata is still called', async () => {
    const h = {
      redirect: () => {}
    }
    const mockSetData = jest.fn()

    const { fileUploadPageRoute } = await import('../file-upload.js')
    const arr = fileUploadPageRoute(null, '/path', null, null, null, null, mockSetData)
    await arr[1].handler({}, h)
    expect(mockSetData).toHaveBeenCalledTimes(1)
  })
})
