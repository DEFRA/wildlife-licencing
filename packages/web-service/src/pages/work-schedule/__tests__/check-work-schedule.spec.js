describe('the check-work-schedule page handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
  })

  describe('the checkData function', () => {
    it('checks there is a fileUpload object set in the cache and if not redirects to the upload page', async () => {
      const mockRedirect = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({ })
        })
      }
      const h = {
        redirect: mockRedirect
      }
      const { checkData } = await import('../check-work-schedule.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith('/upload-work-schedule')
    })

    it('checks there is a fileUpload object set in the cache and if so returns null', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ fileUpload: {} })
        })
      }
      const { checkData } = await import('../check-work-schedule.js')
      const result = await checkData(request, { })
      expect(result).toBeNull()
    })
  })

  describe('the getData function', () => {
    it(' returns the file data', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ fileUpload: { filename: 'hello.txt' } })
        })
      }
      const { getData } = await import('../check-work-schedule.js')
      const result = await getData(request)
      expect(result).toEqual({
        change: '/upload-work-schedule',
        filename: 'hello.txt'
      })
    })
  })

  describe('the completion function', () => {
    it('calls the s3 upload and returns to the tasklist', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            fileUpload: { filename: 'hello.txt', path: '/tmp/path' },
            applicationId: 123
          })
        })
      }
      const mockS3FileUpload = jest.fn()
      jest.doMock('../../../services/s3-upload.js', () => ({
        s3FileUpload: mockS3FileUpload
      }))
      const { completion } = await import('../check-work-schedule.js')
      const result = await completion(request)
      expect(result).toEqual('/tasklist')
      expect(mockS3FileUpload).toHaveBeenCalledWith(123, 'hello.txt', '/tmp/path', 'method-statement')
    })

    it('returns to the upload page if no upload found in the cache', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: 123
          })
        })
      }
      const { completion } = await import('../check-work-schedule.js')
      const result = await completion(request)
      expect(result).toEqual('/upload-work-schedule')
    })
  })
})
