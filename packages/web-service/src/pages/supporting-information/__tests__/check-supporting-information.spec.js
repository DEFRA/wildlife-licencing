describe('the check-supporting-information page handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
  })

  describe('the getData function', () => {
    it(' returns the file data', async () => {
      const mockRemoveUploadedFile = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e', uploadId: '1234567' }))
      const mockGetUploadedFiles = jest.fn(() => ([{ id: '8179c2f2-6eec-43d6-899b-6504d6a1e798', createdAt: '2022-03-25T14:10:14.861Z', updatedAt: '2022-03-25T14:10:14.861Z', applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }]))
      const mockGetData = jest.fn(() => ({ applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: ({
          FILE_UPLOAD: {
            removeUploadedFile: mockRemoveUploadedFile,
            getUploadedFiles: mockGetUploadedFiles
          }
        })
      }))

      const request = {
        cache: () => ({
          getData: mockGetData
        })
      }
      const { getData } = await import('../check-supporting-information.js')
      const result = await getData(request)
      expect(mockGetData).toHaveBeenCalled()
      expect(mockGetUploadedFiles).toHaveBeenCalledWith('afda812d-c4df-4182-9978-19e6641c4a6e')
      expect(result).toEqual([{
        applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e',
        id: '8179c2f2-6eec-43d6-899b-6504d6a1e798',
        removeUploadUrl: '/remove/upload',
        updatedAt: '2022-03-25T14:10:14.861Z',
        createdAt: '2022-03-25T14:10:14.861Z',
        uploadedDate: '25 March 2022'
      }]
      )
    })
  })

  describe('the completion function', () => {
    it('should returns to the task list page if the user selected no to upload another file', async () => {
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

      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          inProgress: 'inProgress'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return {
                set: () => jest.fn()
              }
            }
          },
          FILE_UPLOAD: {
            getUploadedFiles: () => {
              return {}
            }
          }
        })
      }))

      const { completion } = await import('../check-supporting-information.js')
      const result = await completion(request)
      expect(result).toEqual('/tasklist')
    })

    it('should returns to the upload page if the user selected yes to upload another file and removes the tag', async () => {
      const mockSet = jest.fn()
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

      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          inProgress: 'inProgress'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return {
                set: mockSet
              }
            }
          }
        })
      }))
      const { completion } = await import('../check-supporting-information.js')
      const result = await completion(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'supporting-information', tagState: 'inProgress' })
      expect(result).toEqual('/upload-supporting-information')
    })

    it('should returns to the task list page and add completed tag', async () => {
      const mockSet = jest.fn()
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

      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return {
                set: mockSet
              }
            }
          },
          FILE_UPLOAD: {
            getUploadedFiles: () => {
              return [{
                applicationId: 'afda812d-c4df-4182-9978-19e6641c4a6e',
                id: '8179c2f2-6eec-43d6-899b-6504d6a1e798',
                updatedAt: '2022-03-25T14:10:14.861Z',
                createdAt: '2022-03-25T14:10:14.861Z'
              }]
            }
          }
        })
      }))

      const { completion } = await import('../check-supporting-information.js')
      const result = await completion(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'supporting-information', tagState: 'complete' })
      expect(result).toEqual('/tasklist')
    })

    it('should display a validation error if the user does not input a choice for another file upload', async () => {
      try {
        const payload = {}
        const { validator } = await import('../check-supporting-information.js')
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
      const { validator } = await import('../check-supporting-information.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
