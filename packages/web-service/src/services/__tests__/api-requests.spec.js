
describe('The API requests service', () => {
  beforeEach(() => jest.resetModules())

  describe('USER requests', () => {
    it('findById calls the API connector correctly', async () => {
      const mockGet = jest.fn(() => ({ username: 'Keith Moon' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.USER.getById('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(mockGet).toHaveBeenCalledWith('/user/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(result).toEqual({ username: 'Keith Moon' })
    })

    it('findById rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.USER.getById('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')).rejects.toThrow()
    })

    it('findByName calls the API connector correctly', async () => {
      const mockGet = jest.fn(() => [{ user: 123 }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.USER.findByName('fred.flintstone@email.co.uk')
      expect(mockGet).toHaveBeenCalledWith('/users', 'username=fred.flintstone@email.co.uk')
      expect(result).toEqual({ user: 123 })
    })

    it('findByName returns null for the empty array', async () => {
      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.USER.findByName('fred.flintstone@email.co.uk')
      expect(mockGet).toHaveBeenCalledWith('/users', 'username=fred.flintstone@email.co.uk')
      expect(result).toBeNull()
    })

    it('findByName rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.USER.findByName('fred.flintstone@email.co.uk'))
        .rejects.toThrowError()
    })

    it('create calls the API connector correctly', async () => {
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.USER.create('fred.flintstone@email.co.uk')
      expect(mockPost).toHaveBeenCalledWith('/user', { username: 'fred.flintstone@email.co.uk' })
    })

    it('create rethrows an error', async () => {
      const mockPost = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.USER.create('fred.flintstone@email.co.uk'))
        .rejects.toThrowError()
    })
  })

  describe('APPLICATION requests', () => {
    it('create calls the API connector correctly', async () => {
      const mockPost = jest.fn(() => ({ id: 'applicationId' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICATION.create('type')
      expect(mockPost).toHaveBeenCalledWith('/application', {
        applicationType: 'type'
      })
    })

    it('create rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICATION.create('fred.flintstone@email.co.uk'))
        .rejects.toThrowError()
    })

    it('initialize calls the API connector correctly where no association exists', async () => {
      const mockPost = jest.fn(() => ({
        id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
        userId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        role: 'role1'
      }))
      const mockGet = jest.fn()
        .mockReturnValueOnce([])
        .mockReturnValueOnce({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', applicationType: 'badger' })
        .mockReturnValue({ ref: 'REF-NO' })
      const mockPut = jest.fn(() => ({
        id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        applicationReferenceNumber: 'REF-NO',
        applicationType: 'badger'
      }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost,
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.APPLICATION.initialize('b306c67f-f5cd-4e69-9986-8390188051b3',
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', 'role1')

      expect(mockGet).toHaveBeenCalledWith('/application-users', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3&applicationId=56ea844c-a2ba-4af8-9b2d-425a9e1c21c8&role=role1')
      expect(mockGet).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(mockGet).toHaveBeenCalledWith('/applications/get-reference', 'applicationType=badger')
      expect(mockPost).toHaveBeenCalledWith('/application-user', { applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', role: 'role1', userId: 'b306c67f-f5cd-4e69-9986-8390188051b3' })
      expect(mockPut).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { applicationReferenceNumber: 'REF-NO', applicationType: 'badger' })
      expect(result).toEqual({
        application: {
          applicationReferenceNumber: 'REF-NO',
          id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          applicationType: 'badger'
        },
        applicationUser: {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          role: 'role1',
          userId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
        }
      })
    })

    it('initialize calls the API connector correctly where an existing association exists', async () => {
      const mockGet = jest.fn()
        .mockReturnValueOnce([{
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          role: 'role1',
          userId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
        }]).mockReturnValueOnce({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', applicationType: 'badger' })
        .mockReturnValue({ ref: 'REF-NO' })

      const mockPut = jest.fn(() => ({
        id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        applicationReferenceNumber: 'REF-NO',
        applicationType: 'badger'
      }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.APPLICATION.initialize('b306c67f-f5cd-4e69-9986-8390188051b3',
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', 'role1')

      expect(mockGet).toHaveBeenCalledWith('/application-users', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3&applicationId=56ea844c-a2ba-4af8-9b2d-425a9e1c21c8&role=role1')
      expect(mockGet).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(mockGet).toHaveBeenCalledWith('/applications/get-reference', 'applicationType=badger')
      expect(mockPut).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { applicationReferenceNumber: 'REF-NO', applicationType: 'badger' })
      expect(result).toEqual({
        application: {
          applicationReferenceNumber: 'REF-NO',
          id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          applicationType: 'badger'
        },
        applicationUser: {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          role: 'role1',
          userId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
        }
      })
    })

    it('initialize calls the API connector correctly where an existing reference number exists', async () => {
      const mockGet = jest.fn()
        .mockReturnValueOnce([{
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          role: 'role1',
          userId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
        }]).mockReturnValue({
          id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          applicationType: 'badger',
          applicationReferenceNumber: 'REF-NO'
        })

      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))

      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.APPLICATION.initialize('b306c67f-f5cd-4e69-9986-8390188051b3',
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', 'role1')

      expect(mockGet).toHaveBeenCalledWith('/application-users', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3&applicationId=56ea844c-a2ba-4af8-9b2d-425a9e1c21c8&role=role1')
      expect(mockGet).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(result).toEqual({
        application: {
          applicationReferenceNumber: 'REF-NO',
          id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          applicationType: 'badger'
        },
        applicationUser: {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          role: 'role1',
          userId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
        }
      })
    })

    it('initialize rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICATION.initialize('b306c67f-f5cd-4e69-9986-8390188051b3',
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', 'role1'))
        .rejects.toThrowError()
    })

    it('findByUser calls the API correctly', async () => {
      const mockGet = jest.fn(() => [{ foo: 'bar' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.APPLICATION.findByUser('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/applications', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual([{ foo: 'bar' }])
    })

    it('findByUser rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICATION.findByUser('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('getById calls the API correctly', async () => {
      const mockGet = jest.fn(() => [{ foo: 'bar' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.APPLICATION.getById('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual([{ foo: 'bar' }])
    })

    it('getById rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICATION.getById('b306c67f-f5cd-4e69-9986-8390188051b3', '9913c6c2-1cdf-4582-a591-92c058d0e07d'))
        .rejects.toThrowError()
    })

    it('findRoles calls the API correctly', async () => {
      const mockGet = jest.fn(() => ['USER'])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICATION.findRoles('9913c6c2-1cdf-4582-a591-92c058d0e07d', 'USER')
      expect(mockGet).toHaveBeenCalledWith('/application-users', 'userId=9913c6c2-1cdf-4582-a591-92c058d0e07d&applicationId=USER')
    })

    it('findRoles rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICATION.findRoles('9913c6c2-1cdf-4582-a591-92c058d0e07d', 'USER'))
        .rejects.toThrowError()
    })

    it('submit calls the API correctly', async () => {
      const mockSubmit = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockSubmit
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICATION.submit('9913c6c2-1cdf-4582-a591-92c058d0e07d')
      expect(mockSubmit).toHaveBeenCalledWith('/application/9913c6c2-1cdf-4582-a591-92c058d0e07d/submit')
    })

    it('submit rethrows an error', async () => {
      const mockSubmit = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockSubmit
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICATION.submit('b306c67f-f5cd-4e69-9986-8390188051b3', '9913c6c2-1cdf-4582-a591-92c058d0e07d'))
        .rejects.toThrowError()
    })
  })

  describe('ELIGIBILITY requests', () => {
    it('getById calls the API correctly', async () => {
      const mockGet = jest.fn(() => ({ foo: 'bar' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ELIGIBILITY.getById('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3/eligibility')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getById rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ELIGIBILITY.getById('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('putById calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ELIGIBILITY.putById('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3/eligibility', { foo: 'bar' })
    })

    it('putById rethrows an error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ELIGIBILITY.putById('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })
  })

  describe('APPLICANT requests', () => {
    it('getById calls the API correctly', async () => {
      const mockGet = jest.fn(() => ({ foo: 'bar' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.APPLICANT.getById('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3/applicant')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getById rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT.getById('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('putById calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.putById('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3/applicant', { foo: 'bar' })
    })

    it('putById rethrows an error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT.putById('b306c67f-f5cd-4e69-9986-8390188051b3', {}))
        .rejects.toThrowError()
    })

    it('findByUser calls the API correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.findByUser('b306c67f-f5cd-4e69-9986-8390188051b3', 'USER')
      expect(mockGet).toHaveBeenCalledWith('/applications/applicant', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3&role=USER')
    })

    it('findByUser rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT.findByUser('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })
  })

  describe('ECOLOGIST requests', () => {
    it('getById calls the API correctly', async () => {
      const mockGet = jest.fn(() => ({ foo: 'bar' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ECOLOGIST.getById('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3/ecologist')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getById rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST.getById('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('putById calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.putById('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3/ecologist', { foo: 'bar' })
    })

    it('putById rethrows an error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST.putById('b306c67f-f5cd-4e69-9986-8390188051b3', {}))
        .rejects.toThrowError()
    })

    it('findByUser calls the API correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.findByUser('b306c67f-f5cd-4e69-9986-8390188051b3', 'USER')
      expect(mockGet).toHaveBeenCalledWith('/applications/ecologist', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3&role=USER')
    })

    it('findByUser rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST.findByUser('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })
  })
})
