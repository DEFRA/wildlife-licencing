
jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests service', () => {
  beforeEach(() => jest.resetModules())

  describe('FILE_UPLOAD requests', () => {
    it('record always posts a new record for a filetype of multiple', async () => {
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.record(
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
      await APIRequests.FILE_UPLOAD.record(
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
      await APIRequests.FILE_UPLOAD.record(
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
    it('record rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.FILE_UPLOAD.record(
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        'hello.txt',
        { filetype: 'greetings', multiple: false },
        'object-key'
      )).rejects.toThrowError()
    })

    it('removeUploadedFile calls the API correctly', async () => {
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.removeUploadedFile('6eec5687-d874-49db-b611-822cbb0068d8', 'a7b72637-8816-495a-8a6b-ebed2c182665')
      expect(mockDelete).toHaveBeenCalledWith('/application/6eec5687-d874-49db-b611-822cbb0068d8/file-upload/a7b72637-8816-495a-8a6b-ebed2c182665')
    })

    it('removeUploadedFile rethrows on error', async () => {
      const mockDelete = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.FILE_UPLOAD.removeUploadedFile('6eec5687-d874-49db-b611-822cbb0068d8', 'a7b72637-8816-495a-8a6b-ebed2c182665'))
        .rejects.toThrowError()
    })

    it('getUploadedFiles calls the API correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.FILE_UPLOAD.getUploadedFiles('6eec5687-d874-49db-b611-822cbb0068d8')
      expect(mockGet).toHaveBeenCalledWith('/application/6eec5687-d874-49db-b611-822cbb0068d8/file-uploads')
    })

    it('getUploadedFiles rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.FILE_UPLOAD.getUploadedFiles('6eec5687-d874-49db-b611-822cbb0068d8'))
        .rejects.toThrowError()
    })
  })

  describe('SITE requests', () => {
    it('create calls the API correctly', async () => {
      const mockPost = jest.fn().mockReturnValueOnce({ id: 1 })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.create('668ee1f0-073d-480c-a802-59db362897e6', { name: 'site' })
      expect(mockPost).toHaveBeenCalledWith('/site', { name: 'site' })
      expect(mockPost).toHaveBeenCalledWith('/application-site', { applicationId: '668ee1f0-073d-480c-a802-59db362897e6', siteId: 1 })
    })

    it('create rethrows on error', async () => {
      const mockPost = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.SITE.create('668ee1f0-073d-480c-a802-59db362897e6', { name: 'site' }))
        .rejects.toThrow()
    })

    it('findByApplicationId calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([{ siteId: 1 }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.findByApplicationId('668ee1f0-073d-480c-a802-59db362897e6')
      expect(mockGet).toHaveBeenCalledWith('/application-sites', 'applicationId=668ee1f0-073d-480c-a802-59db362897e6')
      expect(mockGet).toHaveBeenCalledWith('/site/1')
    })

    it('findByApplicationId rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.SITE.findByApplicationId('668ee1f0-073d-480c-a802-59db362897e6'))
        .rejects.toThrow()
    })

    it('update calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.update('668ee1f0-073d-480c-a802-59db362897e6', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/site/668ee1f0-073d-480c-a802-59db362897e6', { foo: 'bar' })
    })

    it('update rethrows on error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.SITE.update('668ee1f0-073d-480c-a802-59db362897e6', { foo: 'bar' }))
        .rejects.toThrow()
    })

    it('destroy calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValue([{ id: 1 }])
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.SITE.destroy('668ee1f0-073d-480c-a802-59db362897e6', '6e48a6f4-5a27-475d-bd83-561c6e0e80d2')
      expect(mockDelete).toHaveBeenCalledWith('/application-site/1')
      expect(mockDelete).toHaveBeenCalledWith('/site/6e48a6f4-5a27-475d-bd83-561c6e0e80d2')
    })

    it('destroy rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.SITE.destroy('668ee1f0-073d-480c-a802-59db362897e6', '6e48a6f4-5a27-475d-bd83-561c6e0e80d2'))
        .rejects.toThrow()
    })
  })

  describe('HABITAT requests', () => {
    it('create calls the API connector correctly', async () => {
      const mockPost = jest.fn(() => ({ id: 'applicationId' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.create('9d62e5b8-9c77-ec11-8d21-000d3a87431b', { speciesId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
      expect(mockPost).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-site', { speciesId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
    })

    it('create rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.HABITAT.create('fred.flintstone@email.co.uk'))
        .rejects.toThrowError()
    })
    it('create calls the API connector correctly', async () => {
      const payload = { name: 'Corner of field' }
      const mockPost = jest.fn(() => ({ id: 'applicationId' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.create('9d62e5b8-9c77-ec11-8d21-000d3a87431b', payload)
      expect(mockPost).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-site', { name: 'Corner of field' })
    })
    it('getHabitatsById rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.HABITAT.getHabitatsById('9d62e5b8-9c77-ec11-8d21-000d3a87431b'))
        .rejects.toThrowError()
    })
    it('retrieves habitats by ID', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.getHabitatsById('9d62e5b8-9c77-ec11-8d21-000d3a87431b')
      expect(mockGet).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-sites')
    })
    it('getHabitatBySettId rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.HABITAT.getHabitatBySettId('9d62e5b8-9c77-ec11-8d21-000d3a87431b'))
        .rejects.toThrowError()
    })
    it('retrieves habitats by ID', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.putHabitatById('9d62e5b8-9c77-ec11-8d21-000d3a87431b', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', {})
      expect(mockPut).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-site/f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', {})
    })
    it('putHabitatById rethrows an error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.HABITAT.putHabitatById('9d62e5b8-9c77-ec11-8d21-000d3a87431b'))
        .rejects.toThrowError()
    })
    it('deletes a habitat by ID', async () => {
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.HABITAT.deleteSett('9d62e5b8-9c77-ec11-8d21-000d3a87431b', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      expect(mockDelete).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/habitat-site/f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
    })
    it('deleteSett rethrows an error', async () => {
      const mockDelete = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.HABITAT.deleteSett('9d62e5b8-9c77-ec11-8d21-000d3a87431b', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb'))
        .rejects.toThrowError()
    })
  })

  describe('LICENCE requests', () => {
    it('findByApplicationId calls the API connector correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.LICENCES.findByApplicationId('9d62e5b8-9c77-ec11-8d21-000d3a87431b')
      expect(mockGet).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b/licences')
    })
    it('findByApplicationId rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.LICENCES.findByApplicationId('9d62e5b8-9c77-ec11-8d21-000d3a87431b'))
        .rejects.toThrowError()
    })
  })
})
