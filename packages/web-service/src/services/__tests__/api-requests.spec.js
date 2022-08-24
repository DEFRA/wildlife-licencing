
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
      await APIRequests.APPLICATION.create('9d62e5b8-9c77-ec11-8d21-000d3a87431b', '3db073af-201b-ec11-b6e7-0022481a8f18')
      expect(mockPost).toHaveBeenCalledWith('/application', {
        applicationPurposeId: '3db073af-201b-ec11-b6e7-0022481a8f18',
        applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
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
        .mockReturnValueOnce({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
        .mockReturnValue({ ref: 'REF-NO' })
      const mockPut = jest.fn(() => ({
        id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        applicationReferenceNumber: 'REF-NO',
        applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
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
      expect(mockGet).toHaveBeenCalledWith('/applications/get-reference', 'applicationTypeId=9d62e5b8-9c77-ec11-8d21-000d3a87431b')
      expect(mockPost).toHaveBeenCalledWith('/application-user', { applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', role: 'role1', userId: 'b306c67f-f5cd-4e69-9986-8390188051b3' })
      expect(mockPut).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { applicationReferenceNumber: 'REF-NO', applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
      expect(result).toEqual({
        application: {
          applicationReferenceNumber: 'REF-NO',
          id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
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
        }]).mockReturnValueOnce({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
        .mockReturnValue({ ref: 'REF-NO' })

      const mockPut = jest.fn(() => ({
        id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        applicationReferenceNumber: 'REF-NO',
        applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
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
      expect(mockGet).toHaveBeenCalledWith('/applications/get-reference', 'applicationTypeId=9d62e5b8-9c77-ec11-8d21-000d3a87431b')
      expect(mockPut).toHaveBeenCalledWith('/application/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { applicationReferenceNumber: 'REF-NO', applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' })
      expect(result).toEqual({
        application: {
          applicationReferenceNumber: 'REF-NO',
          id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
          applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
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
          applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
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
          applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
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
    it('getByApplicationId calls the API correctly', async () => {
      const mockGet = jest.fn(() => ([{ foo: 'bar' }]))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.APPLICANT.getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/contacts', 'applicationId=b306c67f-f5cd-4e69-9986-8390188051b3&role=APPLICANT')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getByApplicationId rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT.getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('create calls the API correctly where there is an existing applicant', async () => {
      const mockPost = jest.fn(() => ({ id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' }))
      const mockGet = jest.fn(() => [{
        id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
        contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactRole: 'APPLICANT'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          post: mockPost,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.create('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application-contact/7c3b13ef-c2fb-4955-942e-764593cf0ada', {
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
        contactRole: 'APPLICANT'
      })
      expect(mockPost).toHaveBeenCalledWith('/contact', { foo: 'bar' })
    })

    it('create calls the API correctly where there is no existing applicant', async () => {
      const mockPost = jest.fn()
        .mockReturnValueOnce({ id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
        .mockReturnValueOnce({})
      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.create('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPost).toHaveBeenCalledWith('/application-contact', {
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
        contactRole: 'APPLICANT'
      })
      expect(mockPost).toHaveBeenCalledWith('/contact', { foo: 'bar' })
    })

    it('create rethrows an error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT.create('b306c67f-f5cd-4e69-9986-8390188051b3', {}))
        .rejects.toThrowError()
    })

    it('assign calls the API correctly where there is an existing relationship', async () => {
      const mockGet = jest.fn(() => [{
        id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
        contactId: '00ed369a-6765-45e3-bdad-546b774319f5'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPut).toHaveBeenCalledWith('/application-contact/e8387a83-1165-42e6-afab-add01e77bc4c', {
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
        contactRole: 'APPLICANT'
      })
    })

    it('assign calls the API correctly where the relationship is unchanged', async () => {
      const mockGet = jest.fn(() => [{
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPut).not.toHaveBeenCalled()
    })

    it('assign calls the API correctly where there is no existing relationship', async () => {
      const mockGet = jest.fn(() => [])
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPost).not.toHaveBeenCalledWith()
    })

    it('assign rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT.assign('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('unAssign calls the API correctly where there is a relationship', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn(() => [{
        id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
      }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).toHaveBeenCalledWith('/application-contact/7c3b13ef-c2fb-4955-942e-764593cf0ada')
    })

    it('unAssign does nothing there is no relationship', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).not.toHaveBeenCalledWith()
    })

    it('unAssign rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('update calls the API correctly', async () => {
      const mockPut = jest.fn()
      const mockGet = jest.fn(() => [{
        id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
      }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT.update('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/contact/2342fce0-3067-4ca5-ae7a-23cae648e45c', { foo: 'bar' })
    })

    it('update rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT.update('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' }))
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
      expect(mockGet).toHaveBeenCalledWith('/contacts', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3&role=APPLICANT')
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

  describe('APPLICANT-ORGANISATION requests', () => {
    it('getByApplicationId calls the API correctly', async () => {
      const mockGet = jest.fn(() => ([{ foo: 'bar' }]))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.APPLICANT_ORGANISATION.getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/accounts', 'applicationId=b306c67f-f5cd-4e69-9986-8390188051b3&role=APPLICANT-ORGANISATION')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getByApplicationId rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT_ORGANISATION.getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('create calls the API correctly where there is no existing relationship', async () => {
      const mockPost = jest.fn()
        .mockReturnValueOnce({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' })

      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT_ORGANISATION.create('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockPost).toHaveBeenCalledWith('/application-account', {
        accountId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
        accountRole: 'APPLICANT-ORGANISATION',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      })
    })

    it('create calls the API correctly where there is an existing relationship', async () => {
      const mockPost = jest.fn()
        .mockReturnValueOnce({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' })
      const mockPut = jest.fn()

      const mockGet = jest.fn(() => [{
        id: 'f0de6fcb-098f-40b2-8cdb-0f717a701b60',
        accountId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
        accountRole: 'APPLICANT-ORGANISATION',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      }])

      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT_ORGANISATION.create('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockPut).toHaveBeenCalledWith('/application-account/f0de6fcb-098f-40b2-8cdb-0f717a701b60', {
        accountId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
        accountRole: 'APPLICANT-ORGANISATION',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      })
    })

    it('create rethrows an error', async () => {
      const mockPost = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT_ORGANISATION.create('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('unAssign calls the API correctly where there is an existing relationship', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn(() => [{
        id: 'f0de6fcb-098f-40b2-8cdb-0f717a701b60',
        accountId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
        accountRole: 'APPLICANT-ORGANISATION',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT_ORGANISATION.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).toHaveBeenCalledWith('/application-account/f0de6fcb-098f-40b2-8cdb-0f717a701b60')
    })

    it('unAssign does nothing where there is no existing relationship', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT_ORGANISATION.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).not.toHaveBeenCalledWith()
    })

    it('unAssignAccount rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT_ORGANISATION.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('assign calls the API correctly, swapping contactId', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: jest.fn(() => ([{ id: '8a3e8c32-0138-402c-8913-87e78ed44ebd', accountId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' }]))
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT_ORGANISATION.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '412d7297-643d-485b-8745-cc25a0e6ec0a')
      expect(mockPut).toHaveBeenCalledWith('/application-account/8a3e8c32-0138-402c-8913-87e78ed44ebd', {
        accountId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactRole: 'APPLICANT-ORGANISATION'
      })
    })

    it('assign calls the API correctly, ignoring assigned contactId', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: jest.fn(() => ([{ id: '8a3e8c32-0138-402c-8913-87e78ed44ebd', accountId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' }]))
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT_ORGANISATION.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '6829ad54-bab7-4a78-8ca9-dcf722117a45')
      expect(mockPut).not.toHaveBeenCalled()
    })

    it('assign calls the API correctly, creating a new assignment ', async () => {
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost,
          get: jest.fn(() => ([]))
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT_ORGANISATION.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '6829ad54-bab7-4a78-8ca9-dcf722117a45')
      expect(mockPost).toHaveBeenCalledWith('/application-accounts', { accountId: '6829ad54-bab7-4a78-8ca9-dcf722117a45', applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3', contactRole: 'APPLICANT-ORGANISATION' })
    })

    it('assign rethrows on error', async () => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: jest.fn(() => { throw new Error() })
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT_ORGANISATION.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '6829ad54-bab7-4a78-8ca9-dcf722117a45'))
        .rejects.toThrowError()
    })

    it('update calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: jest.fn(() => ([{ accountId: 'f789913d-a095-4150-8aaf-7addd38d3092' }]))
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICANT_ORGANISATION.update('9b0133b9-d140-42d8-ab61-10c095e55dd3', { name: 'Ltd.' })
      expect(mockPut).toHaveBeenCalledWith('/account/f789913d-a095-4150-8aaf-7addd38d3092', { name: 'Ltd.' })
    })

    it('update rethrows on error', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: jest.fn(() => { throw new Error() })
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT_ORGANISATION.update('9b0133b9-d140-42d8-ab61-10c095e55dd3', { name: 'Ltd.' }))
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
      await APIRequests.APPLICANT_ORGANISATION.findByUser('f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      expect(mockGet).toHaveBeenCalledWith('/accounts', 'userId=f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb&role=APPLICANT-ORGANISATION')
    })

    it('findByUser rethrows on error', async () => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: jest.fn(() => { throw new Error() })
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.APPLICANT_ORGANISATION.findByUser('f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb'))
        .rejects.toThrowError()
    })
  })

  describe('ECOLOGIST requests', () => {
    it('getByApplicationId calls the API correctly', async () => {
      const mockGet = jest.fn(() => ([{ foo: 'bar' }]))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ECOLOGIST.getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/contacts', 'applicationId=b306c67f-f5cd-4e69-9986-8390188051b3&role=ECOLOGIST')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getByApplicationId rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST.getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('create calls the API correctly where there is an existing applicant', async () => {
      const mockPost = jest.fn(() => ({ id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' }))
      const mockGet = jest.fn(() => [{
        id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
        contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactRole: 'ECOLOGIST'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          post: mockPost,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.create('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application-contact/7c3b13ef-c2fb-4955-942e-764593cf0ada', {
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
        contactRole: 'ECOLOGIST'
      })
      expect(mockPost).toHaveBeenCalledWith('/contact', { foo: 'bar' })
    })

    it('create calls the API correctly where there is no existing applicant', async () => {
      const mockPost = jest.fn()
        .mockReturnValueOnce({ id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
        .mockReturnValueOnce({})
      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.create('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPost).toHaveBeenCalledWith('/application-contact', {
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
        contactRole: 'ECOLOGIST'
      })
      expect(mockPost).toHaveBeenCalledWith('/contact', { foo: 'bar' })
    })

    it('create rethrows an error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST.create('b306c67f-f5cd-4e69-9986-8390188051b3', {}))
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
      expect(mockGet).toHaveBeenCalledWith('/contacts', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3&role=ECOLOGIST')
    })

    it('assign calls the API correctly where there is an existing relationship', async () => {
      const mockGet = jest.fn(() => [{
        id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
        contactId: '00ed369a-6765-45e3-bdad-546b774319f5'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPut).toHaveBeenCalledWith('/application-contact/e8387a83-1165-42e6-afab-add01e77bc4c', {
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
        contactRole: 'ECOLOGIST'
      })
    })

    it('assign calls the API correctly where the relationship is unchanged', async () => {
      const mockGet = jest.fn(() => [{
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPut).not.toHaveBeenCalled()
    })

    it('assign calls the API correctly where there is no existing relationship', async () => {
      const mockGet = jest.fn(() => [])
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPost).toHaveBeenCalledWith('/application-contacts', { applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3', contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c', contactRole: 'ECOLOGIST' })
    })

    it('assign rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST.assign('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('unAssign calls the API correctly where there is a relationship', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn(() => [{
        id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
      }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).toHaveBeenCalledWith('/application-contact/7c3b13ef-c2fb-4955-942e-764593cf0ada')
    })

    it('unAssign does nothing there is no relationship', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete,
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).not.toHaveBeenCalledWith()
    })

    it('unAssign rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('update calls the API correctly', async () => {
      const mockPut = jest.fn()
      const mockGet = jest.fn(() => [{
        id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
      }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST.update('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/contact/2342fce0-3067-4ca5-ae7a-23cae648e45c', { foo: 'bar' })
    })

    it('update rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST.update('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' }))
        .rejects.toThrowError()
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

  describe('ECOLOGIST-ORGANISATION requests', () => {
    it('getByApplicationId calls the API correctly', async () => {
      const mockGet = jest.fn(() => ([{ foo: 'bar' }]))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ECOLOGIST_ORGANISATION.getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/accounts', 'applicationId=b306c67f-f5cd-4e69-9986-8390188051b3&role=ECOLOGIST-ORGANISATION')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getByApplicationId rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_ORGANISATION.getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('create calls the API correctly where there is no existing relationship', async () => {
      const mockPost = jest.fn()
        .mockReturnValueOnce({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' })

      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_ORGANISATION.create('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockPost).toHaveBeenCalledWith('/application-account', {
        accountId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
        accountRole: 'ECOLOGIST-ORGANISATION',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      })
    })

    it('create calls the API correctly where there is an existing relationship', async () => {
      const mockPost = jest.fn()
        .mockReturnValueOnce({ id: '5eac8c64-7fa6-4418-bf24-ea2766ce802a' })
      const mockPut = jest.fn()

      const mockGet = jest.fn(() => [{
        id: 'f0de6fcb-098f-40b2-8cdb-0f717a701b60',
        accountId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
        accountRole: 'ECOLOGIST-ORGANISATION',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      }])

      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_ORGANISATION.create('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockPut).toHaveBeenCalledWith('/application-account/f0de6fcb-098f-40b2-8cdb-0f717a701b60', {
        accountId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
        accountRole: 'ECOLOGIST-ORGANISATION',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      })
    })

    it('create rethrows an error', async () => {
      const mockPost = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_ORGANISATION.create('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('unAssign calls the API correctly where there is an existing relationship', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn(() => [{
        id: 'f0de6fcb-098f-40b2-8cdb-0f717a701b60',
        accountId: '5eac8c64-7fa6-4418-bf24-ea2766ce802a',
        accountRole: 'ECOLOGIST-ORGANISATION',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_ORGANISATION.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).toHaveBeenCalledWith('/application-account/f0de6fcb-098f-40b2-8cdb-0f717a701b60')
    })

    it('unAssign does nothing where there is no existing relationship', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn(() => [])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_ORGANISATION.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).not.toHaveBeenCalledWith()
    })

    it('unAssignAccount rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_ORGANISATION.unAssign('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('assign calls the API correctly, swapping contactId', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: jest.fn(() => ([{ id: '8a3e8c32-0138-402c-8913-87e78ed44ebd', accountId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' }]))
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_ORGANISATION.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '412d7297-643d-485b-8745-cc25a0e6ec0a')
      expect(mockPut).toHaveBeenCalledWith('/application-account/8a3e8c32-0138-402c-8913-87e78ed44ebd', {
        accountId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactRole: 'ECOLOGIST-ORGANISATION'
      })
    })

    it('assign calls the API correctly, ignoring assigned contactId', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: jest.fn(() => ([{ id: '8a3e8c32-0138-402c-8913-87e78ed44ebd', accountId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' }]))
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_ORGANISATION.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '6829ad54-bab7-4a78-8ca9-dcf722117a45')
      expect(mockPut).not.toHaveBeenCalled()
    })

    it('assign calls the API correctly, creating a new assignment ', async () => {
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost,
          get: jest.fn(() => ([]))
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_ORGANISATION.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '6829ad54-bab7-4a78-8ca9-dcf722117a45')
      expect(mockPost).toHaveBeenCalledWith('/application-accounts', { accountId: '6829ad54-bab7-4a78-8ca9-dcf722117a45', applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3', contactRole: 'ECOLOGIST-ORGANISATION' })
    })

    it('assign rethrows on error', async () => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: jest.fn(() => { throw new Error() })
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_ORGANISATION.assign('b306c67f-f5cd-4e69-9986-8390188051b3', '6829ad54-bab7-4a78-8ca9-dcf722117a45'))
        .rejects.toThrowError()
    })

    it('update calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: jest.fn(() => ([{ accountId: 'f789913d-a095-4150-8aaf-7addd38d3092' }]))
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_ORGANISATION.update('9b0133b9-d140-42d8-ab61-10c095e55dd3', { name: 'Ltd.' })
      expect(mockPut).toHaveBeenCalledWith('/account/f789913d-a095-4150-8aaf-7addd38d3092', { name: 'Ltd.' })
    })

    it('update rethrows on error', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut,
          get: jest.fn(() => { throw new Error() })
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_ORGANISATION.update('9b0133b9-d140-42d8-ab61-10c095e55dd3', { name: 'Ltd.' }))
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
      await APIRequests.ECOLOGIST_ORGANISATION.findByUser('f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      expect(mockGet).toHaveBeenCalledWith('/accounts', 'userId=f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb&role=ECOLOGIST-ORGANISATION')
    })

    it('findByUser rethrows on error', async () => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: jest.fn(() => { throw new Error() })
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_ORGANISATION.findByUser('f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb'))
        .rejects.toThrowError()
    })
  })

  describe('HABITAT requests', () => {
    const payload = { name: 'Corner of field' }
    it('create calls the API connector correctly', async () => {
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

    it('create rethrows an error', async () => {
      const mockPost = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.HABITAT.create('fred.flintstone@email.co.uk'))
        .rejects.toThrowError()
    })
  })
  it('getHabitatsById rethrows an error', async () => {
    const mockGet = jest.fn(() => { throw new Error() })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      API: {
        get: mockGet
      }
    }))
    const { APIRequests } = await import('../api-requests.js')
    try {
      await expect(() => APIRequests.HABITAT.getHabitatsById('9d62e5b8-9c77-ec11-8d21-000d3a87431b'))
    } catch (e) {
      expect(e.statusCode).toBe(500)
    }
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
  describe('LICENCE requests', () => {
    it('findByAp8licationId calls the API connector correctly', async () => {
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
