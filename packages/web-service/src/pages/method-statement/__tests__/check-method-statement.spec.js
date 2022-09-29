describe('the check-method-statement page handler', () => {
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
      const { checkData } = await import('../check-method-statement.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith('/upload-method-statement')
    })

    it('checks there is a fileUpload object set in the cache and if so returns null', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ fileUpload: {} })
        })
      }
      const { checkData } = await import('../check-method-statement.js')
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
      const { getData } = await import('../check-method-statement.js')
      const result = await getData(request)
      expect(result).toEqual({
        change: '/upload-method-statement',
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
          }),
          getPageData: () => ({
            payload: {
              'another-file-check': 'no'
            }
          })
        })
      }
      const mockS3FileUpload = jest.fn()
      jest.doMock('../../../services/s3-upload.js', () => ({
        s3FileUpload: mockS3FileUpload
      }))
      const { completion } = await import('../check-method-statement.js')
      const result = await completion(request)
      expect(result).toEqual('/tasklist')
      expect(mockS3FileUpload).toHaveBeenCalledWith(123, 'hello.txt', '/tmp/path',
        { filetype: 'METHOD-STATEMENT', multiple: true })
    })

    it('returns to the upload page if no upload found in the cache', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: 123
          }),
          getPageData: () => ({
            payload: {
              'another-file-check': 'no'
            }
          })
        })
      }
      const { completion } = await import('../check-method-statement.js')
      const result = await completion(request)
      expect(result).toEqual('/upload-method-statement')
    })

    it('should returns to the upload page if the user selected yes to upload another file', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            fileUpload: { filename: 'hello.txt', path: '/tmp/path' },
            applicationId: 123
          }),
          getPageData: () => ({
            payload: {
              'another-file-check': 'yes'
            }
          })
        })
      }
      const { completion } = await import('../check-method-statement.js')
      const result = await completion(request)
      expect(result).toEqual('/upload-method-statement')
    })

    it('should display a validation error if the user does not input a choice for another file upload', async () => {
      try {
        const payload = {}
        const { validator } = await import('../check-method-statement.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: Option for another file upload has not been chosen')
      }
    })

    it('should not display an error if the user input a choice for another file upload', async () => {
      const payload = {
        'another-file-check': 'no'
      }
      const { validator } = await import('../check-method-statement.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
