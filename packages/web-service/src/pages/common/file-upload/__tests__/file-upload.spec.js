import fs from 'fs'
import { MAX_FILE_UPLOAD_SIZE_MB } from '../../../../constants.js'

describe('the generic file-upload page handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('if the user doesnt attach a file - then it causes a joi error', async () => {
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

  it('a file that\'s too big causes a joi error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: 320000000, filename: 'ok.txt', path: '/tmp/123' } }
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

  it('a file that\'s is not too big, causes no error', async () => {
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => jest.fn())

    const payload = { 'scan-file': { bytes: MAX_FILE_UPLOAD_SIZE_MB - 100, filename: 'ok.txt', path: '/tmp/123' } }
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))

    const { validator } = await import('../file-upload.js')
    expect(async () => await validator(payload)).not.toThrow()
  })

  it('a file that contains a virus causes a joi error', async () => {
    jest.doMock('../../../../services/virus-scan.js', () => ({
      scanFile: () => {
        return true
      }
    }))

    const mockSetData = jest.fn()
    const mockSetPageData = jest.fn()

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
          setData: mockSetData,
          setPageData: mockSetPageData
        }
      )
    }

    const { setData } = await import('../file-upload.js')
    await setData(request)
    expect(mockSetData).toHaveBeenCalledWith({
      applicationId: '68855554-59ed-ec11-bb3c-000d3a0cee24',
      fileUpload: {
        filename: 'hello.txt',
        path: '/tmp/12345'
      }
    })
    expect(mockSetPageData).toHaveBeenCalledWith({
      error: {
        'scan-file': 'infected'
      },
      payload: {
        'scan-file': {
          filename: 'hello.txt',
          path: '/tmp/12345'
        }
      }
    })
  })

  it('a file that has no error clears the page cache', async () => {
    jest.doMock('../../../../services/virus-scan.js', () => ({
      scanFile: () => {
        return false
      }
    }))
    const mockSetData = jest.fn()
    const mockClearPageData = jest.fn()

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
          setData: mockSetData,
          clearPageData: mockClearPageData
        }
      )
    }
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const { setData } = await import('../file-upload.js')
    await setData(request)
    expect(mockClearPageData).toHaveBeenCalled()
  })
})
