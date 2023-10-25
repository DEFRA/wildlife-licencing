jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests file-upload service', () => {
  describe('FILE_UPLOAD requests for applications', () => {
    beforeEach(() => jest.resetModules())

    it('record always posts a new record for a filetype of multiple', async () => {
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.APPLICATION.record(
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        'hello.txt',
        { filetype: 'greetings', multiple: true },
        'object-key'
      )
      expect(mockPost).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-upload',
        {
          filename: 'hello.txt',
          filetype: 'greetings',
          objectKey: 'object-key'
        })
    })

    it('record posts a record for a filetype of not-multiple where there are no un-submitted records of that filetype', async () => {
      const mockPost = jest.fn()
      const mockGet = jest.fn(() => [
        { submitted: '2022-10-05T14:48:00.000Z' }
      ])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.APPLICATION.record(
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        'hello.txt',
        { filetype: 'greetings', multiple: false },
        'object-key'
      )
      expect(mockGet).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-uploads', 'filetype=greetings')
      expect(mockPost).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-upload',
        {
          filename: 'hello.txt',
          filetype: 'greetings',
          objectKey: 'object-key'
        })
    })

    it('record puts a record for a filetype of not-multiple where there are un-submitted records of that filetype', async () => {
      const mockPut = jest.fn()
      const mockGet = jest.fn(() => [
        { submitted: '2022-10-05T14:48:00.000Z' },
        { id: 'e6b8de2e-51dc-4196-aa69-5725b3aff732', submitted: null }
      ])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.APPLICATION.record(
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        'hello.txt',
        { filetype: 'greetings', multiple: false },
        'object-key'
      )
      expect(mockGet).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-uploads', 'filetype=greetings')
      expect(mockPut).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-upload/e6b8de2e-51dc-4196-aa69-5725b3aff732',
        {
          filename: 'hello.txt',
          filetype: 'greetings',
          objectKey: 'object-key'
        })
    })

    it('removeUploadedFile calls the API correctly', async () => {
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.APPLICATION.removeUploadedFile('6eec5687-d874-49db-b611-822cbb0068d8', 'a7b72637-8816-495a-8a6b-ebed2c182665')
      expect(mockDelete).toHaveBeenCalledWith('/application/6eec5687-d874-49db-b611-822cbb0068d8/file-upload/a7b72637-8816-495a-8a6b-ebed2c182665')
    })

    it('getUploadedFiles calls the API correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.APPLICATION.getUploadedFiles('6eec5687-d874-49db-b611-822cbb0068d8')
      expect(mockGet).toHaveBeenCalledWith('/application/6eec5687-d874-49db-b611-822cbb0068d8/file-uploads')
    })
  })
  describe('FILE_UPLOAD requests for returns', () => {
    beforeEach(() => jest.resetModules())

    it('record always posts a new record for a filetype of multiple', async () => {
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.RETURN.record(
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        'hello.txt',
        { filetype: 'greetings', multiple: true },
        'object-key'
      )
      expect(mockPost).toHaveBeenCalledWith('/return/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-upload',
        {
          filename: 'hello.txt',
          filetype: 'greetings',
          objectKey: 'object-key'
        })
    })

    it('record posts a record for a filetype of not-multiple where there are no un-submitted records of that filetype', async () => {
      const mockPost = jest.fn()
      const mockGet = jest.fn(() => [
        { submitted: '2022-10-05T14:48:00.000Z' }
      ])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.RETURN.record(
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        'hello.txt',
        { filetype: 'greetings', multiple: false },
        'object-key'
      )
      expect(mockGet).toHaveBeenCalledWith('/return/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-uploads', 'filetype=greetings')
      expect(mockPost).toHaveBeenCalledWith('/return/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-upload',
        {
          filename: 'hello.txt',
          filetype: 'greetings',
          objectKey: 'object-key'
        })
    })

    it('record puts a record for a filetype of not-multiple where there are un-submitted records of that filetype', async () => {
      const mockPut = jest.fn()
      const mockGet = jest.fn(() => [
        { submitted: '2022-10-05T14:48:00.000Z' },
        { id: 'e6b8de2e-51dc-4196-aa69-5725b3aff732', submitted: null }
      ])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.APPLICATION.record(
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        'hello.txt',
        { filetype: 'greetings', multiple: false },
        'object-key'
      )
      expect(mockGet).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-uploads', 'filetype=greetings')
      expect(mockPut).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8/file-upload/e6b8de2e-51dc-4196-aa69-5725b3aff732',
        {
          filename: 'hello.txt',
          filetype: 'greetings',
          objectKey: 'object-key'
        })
    })

    it('removeUploadedFile calls the API correctly', async () => {
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.RETURN.removeUploadedFile('6eec5687-d874-49db-b611-822cbb0068d8', 'a7b72637-8816-495a-8a6b-ebed2c182665')
      expect(mockDelete).toHaveBeenCalledWith('/return/6eec5687-d874-49db-b611-822cbb0068d8/file-upload/a7b72637-8816-495a-8a6b-ebed2c182665')
    })

    it('getUploadedFiles calls the API correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.RETURN.getUploadedFiles('6eec5687-d874-49db-b611-822cbb0068d8')
      expect(mockGet).toHaveBeenCalledWith('/return/6eec5687-d874-49db-b611-822cbb0068d8/file-uploads')
    })
  })
})
