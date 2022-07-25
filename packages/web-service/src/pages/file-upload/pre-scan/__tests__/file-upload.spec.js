import fs from 'fs'
import path from 'path'
import { CHECK_YOUR_ANSWERS, FILE_UPLOAD } from '../../../../uris.js'

describe('the file-upload page handler', () => {
  beforeEach(() => jest.resetModules())
  it('if the user doesnt attach a file - then it causes a joi error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: 0, filename: '', path: 'scandir/' } }
    try {
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
      const { validator } = await import('../file-upload.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: the file was too large')
    }
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
})
