import fs from 'fs'
import { MAX_FILE_UPLOAD_SIZE_MB } from '../../../../constants.js'

describe('the generic file-upload page handler', () => {
  beforeEach(() => jest.resetModules())
  it('if the user does not attach a file - then it causes a joi error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: 0, filename: '', path: '/tmp/123' } }
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

  it('a file that contains a virus causes a joi error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: MAX_FILE_UPLOAD_SIZE_MB - 100, filename: 'ok.JPG', path: '/tmp/123' } }
    try {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve() })
      }))

      jest.doMock('../../../../services/virus-scan.js', () => ({
        scanFile: () => {
          return true
        }
      }))

      const { validator } = await import('../file-upload.js')
      expect(await validator(payload, 'METHOD-STATEMENT'))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: the file contains a virus')
    }
  })

  it('a file that has no error clears the page cache', async () => {
    jest.doMock('../../../../services/virus-scan.js', () => ({
      scanFile: () => {
        return false
      }
    }))
    const mockSetData = jest.fn()

    const request = {
      payload: {
        'scan-file': {
          filename: 'hello.txt',
          path: '/tmp/12345'
        }
      },

      cache: () => (
        {
          getData: () => ({ applicationId: '68855554-59ed-ec11-bb3c-000d3a0cee24' }),
          setData: mockSetData
        }
      )
    }
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const { setData } = await import('../file-upload.js')
    await setData(request)
  })

  it('getFileExtension', async () => {
    const payload = { filename: 'ok.txt' }
    const { getFileExtension } = await import('../file-upload.js')
    expect(await getFileExtension(payload)).toBeFalsy()
  })

  it('should throw a joi error, when the file size is too large', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: MAX_FILE_UPLOAD_SIZE_MB + 100, filename: 'ok.doc', path: '/tmp/123' } }
    try {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve() })
      }))
      const { validator } = await import('../file-upload.js')
      expect(await validator(payload, 'METHOD-STATEMENT'))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: the file was too large')
    }
  })

  it('should throw a joi error, when the file extension is not from the supporting information accepted type', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: MAX_FILE_UPLOAD_SIZE_MB - 100, filename: 'ok.txt', path: '/tmp/123' } }
    try {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve() })
      }))
      const { validator } = await import('../file-upload.js')
      expect(await validator(payload, 'METHOD-STATEMENT'))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: The selected file must be a JPG, BMP, PNG, TIF, KML, Shape, DOC, DOCX, ODT, XLS, XLSX, GeoJSON, ODS or PDF')
    }
  })

  it('should throw a joi error, when the file extension is not from the site map accepted type', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: MAX_FILE_UPLOAD_SIZE_MB - 100, filename: 'ok.txt', path: '/tmp/123' } }
    try {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve() })
      }))
      const { validator } = await import('../file-upload.js')
      expect(await validator(payload, 'MAP'))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: The selected file must be a JPG, BMP, PNG, TIF, KML, Shape, DOC, DOCX, ODT, XLS, XLSX, GeoJSON, ODS or PDF')
    }
  })

  it('fileUploadPageRoute with function', async () => {
    const mockRedirect = jest.fn()
    const completion = jest.fn()
    const getData = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({
          fileUpload: { filename: 'hello.txt', path: '/tmp/path' },
          applicationId: 123
        }),
        setData: jest.fn(() => ({}))
      }),
      payload: {
        'scan-file': { filename: 'hello.txt', path: '/tmp/path' }
      }
    }
    const { fileUploadPageRoute } = await import('../file-upload.js')
    const result = fileUploadPageRoute({
      view: 'upload-map',
      fileUploadUri: '/upload-map',
      fileUploadCompletion: completion,
      getData
    })
    const route = result.find(r => r.method === 'POST' && r.path === '/upload-map')

    const h = {
      redirect: mockRedirect
    }
    await route.handler(request, h)
    expect(mockRedirect).toHaveBeenCalled()
  })

  it('fileUploadPageRoute with variable', async () => {
    const mockRedirect = jest.fn()
    let fileUploadCompletion
    const getData = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: 123
        }),
        setData: jest.fn()
      }),
      payload: {
        'scan-file': { filename: 'hello.txt', path: '/tmp/path' }
      }
    }
    const { fileUploadPageRoute } = await import('../file-upload.js')
    const result = fileUploadPageRoute({ fileUploadCompletion, getData })
    const route = result.find(r => r.method === 'POST')

    const h = {
      redirect: mockRedirect
    }
    await route.handler(request, h)
    expect(mockRedirect).toHaveBeenCalled()
  })
})
