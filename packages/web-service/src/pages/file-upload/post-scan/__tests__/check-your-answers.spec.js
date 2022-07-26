import { FILE_UPLOAD, TASKLIST } from '../../../../uris.js'

describe('The page to check your file submission after it is scanned', () => {
  beforeEach(() => jest.resetModules())
  describe('The checkData function calls on load', () => {
    it('returns the file upload redirect if no filename is present in the cache', async () => {
      const mockGet = jest.fn(() => {})
      // const mockRedirect = jest.fn((uri) => ({ uri: uri }))
      const request = {
        cache: () => ({
          getData: mockGet,
          clearPageData: () => jest.fn()
        })
      }
      const h = {
        redirect: (url) => url
      }
      const { checkData } = await import('../check-your-answers.js')
      const result = await checkData(request, h)
      expect(mockGet).toHaveBeenCalled()
      expect(result).toEqual(FILE_UPLOAD.uri)
    })
    it('returns null if filename is present in the cache', async () => {
      const mockGet = jest.fn(() => ({ filename: 'badgers.doc' }))
      // const mockRedirect = jest.fn((uri) => ({ uri: uri }))
      const request = {
        cache: () => ({
          getData: mockGet,
          clearPageData: () => jest.fn()
        })
      }
      const h = {
        redirect: (url) => url
      }
      const { checkData } = await import('../check-your-answers.js')
      const result = await checkData(request, h)
      expect(mockGet).toHaveBeenCalled()
      expect(result).toEqual(null)
    })
  })
  describe('The getData function', () => {
    it('Returns file-upload pageData', async () => {
      const mockGet = jest.fn(() => ({ pageData: 'data' }))
      const request = {
        cache: () => ({
          getData: mockGet
        })
      }
      const { getData } = await import('../check-your-answers.js')
      const result = await getData(request)
      expect(mockGet).toHaveBeenCalled()
      expect(result).toEqual({ pageData: 'data' })
    })
  })
  describe('The completion function runs on form submission', () => {
    it('returns tasklist uri if successful', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '0b357917-9b23-4f16-b460-bcee0ff1103f',
            fileName: 'file.txt',
            path: '/scandir/file.txt'
          })
        })
      }
      jest.doMock('../../../../services/s3-upload.js', () => ({
        S3FileUpload: () => false
      })
      )
      const { completion } = await import('../check-your-answers.js')
      const result = await completion(request)
      expect(result).toEqual(FILE_UPLOAD.uri)
    })
    it('returns file-upload uri if successful', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '0b357917-9b23-4f16-b460-bcee0ff1103f',
            fileName: 'file.txt',
            path: '/scandir/file.txt'
          })
        })
      }
      jest.doMock('../../../../services/s3-upload.js', () => ({
        S3FileUpload: () => true
      })
      )
      const { completion } = await import('../check-your-answers.js')
      const result = await completion(request)
      expect(result).toEqual(TASKLIST.uri)
    })
    it('returns an empty object if the request object is falsy', async () => {
      const request = {
        cache: () => ({
          getData: () => undefined
        })
      }
      const { completion } = await import('../check-your-answers.js')
      const result = await completion(request)
      expect(result).toEqual(FILE_UPLOAD.uri)
    })
  })
})
