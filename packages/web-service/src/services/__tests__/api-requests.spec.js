import { ContactRoles, AccountRoles } from '../../pages/contact/common/common.js'

jest.spyOn(console, 'error').mockImplementation(code => {})

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

    describe('the tag functions', () => {
      it('the add tag function calls the the API correctly if tag present', async () => {
        const mockPut = jest.fn()
        const mockGet = jest.fn(() => ({ foo: 'bar', applicationTags: ['here-before'] }))
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            put: mockPut,
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').add('tag')
        expect(mockPut).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3', {
          applicationTags: expect.arrayContaining(['tag', 'here-before']), foo: 'bar'
        })
      })

      it('the add tag function ignores duplicate tags', async () => {
        const mockGet = jest.fn(() => ({ foo: 'bar', applicationTags: ['tag'] }))
        const mockPut = jest.fn()
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            put: mockPut,
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').add('tag')
        expect(mockPut).not.toHaveBeenCalledWith()
      })

      it('the add tag function rethrows an error', async () => {
        const mockGet = jest.fn(() => { throw new Error() })
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await expect(() => APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').add('tsg-2'))
          .rejects.toThrowError()
      })

      it('the has tag function calls the the API correctly if tag present', async () => {
        const mockGet = jest.fn(() => ({ foo: 'bar', applicationTags: ['tag'] }))
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        const result = await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').has('tag')
        expect(result).toBeTruthy()
      })

      it('the has tag function calls the the API correctly if tag not present', async () => {
        const mockGet = jest.fn(() => ({ foo: 'bar', applicationTags: ['tag'] }))
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        const result = await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').has('tag-2')
        expect(result).not.toBeTruthy()
      })

      it('the has tag function rethrows an error', async () => {
        const mockGet = jest.fn(() => { throw new Error() })
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await expect(() => APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').has('tsg-2'))
          .rejects.toThrowError()
      })

      it('the remove tag function calls the the API correctly if tag present', async () => {
        const mockGet = jest.fn(() => ({ foo: 'bar', applicationTags: ['tag', 'tag-2'] }))
        const mockPut = jest.fn()
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet,
            put: mockPut
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').remove('tag-2')
        expect(mockPut).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3', { applicationTags: ['tag'], foo: 'bar' })
      })

      it('the remove tag function rethrows an error', async () => {
        const mockGet = jest.fn(() => { throw new Error() })
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await expect(() => APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').remove('tsg-2'))
          .rejects.toThrowError()
      })
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

  describe('CONTACT requests', () => {
    it('getById calls the API correctly', async () => {
      const mockGet = jest.fn(() => ({ foo: 'bar' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.CONTACT.getById('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/contact/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getById rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.CONTACT.getById('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('update calls the API correctly', async () => {
      const mockPut = jest.fn(() => ({ foo: 'bar' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.CONTACT.update('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/contact/b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
    })

    it('update rethrows on error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.CONTACT.update('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' }))
        .rejects.toThrowError()
    })

    it('destroy calls the API correctly', async () => {
      const mockDelete = jest.fn(() => ({}))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.CONTACT.destroy('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).toHaveBeenCalledWith('/contact/b306c67f-f5cd-4e69-9986-8390188051b3')
    })

    it('destroy rethrows on error', async () => {
      const mockDelete = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.CONTACT.destroy('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('isImmutable calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce({ id: 'b306c67f-f5cd-4e69-9986-8390188051b3' })
        .mockReturnValue([{ applicationId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.CONTACT.isImmutable('81e36e15-88d0-41e2-9399-1c7646ecc5aa', 'b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/contact/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/application-contacts', 'contactId=b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(true)
    })

    it('isImmutable calls the API correctly - submitted', async () => {
      const mockGet = jest.fn().mockReturnValueOnce({ id: 'b306c67f-f5cd-4e69-9986-8390188051b3', submitted: '2022-09-12T08:12:47+00:00' })
        .mockReturnValue([{ applicationId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.CONTACT.isImmutable('81e36e15-88d0-41e2-9399-1c7646ecc5aa', 'b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/contact/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(true)
    })

    it('isImmutable calls the API correctly - singular', async () => {
      const mockGet = jest.fn().mockReturnValueOnce({ id: 'b306c67f-f5cd-4e69-9986-8390188051b3', submitted: '2022-09-12T08:12:47+00:00' })
        .mockReturnValue([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.CONTACT.isImmutable('81e36e15-88d0-41e2-9399-1c7646ecc5aa', 'b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/contact/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(true)
    })

    it('isImmutable rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.CONTACT.isImmutable('81e36e15-88d0-41e2-9399-1c7646ecc5aa', 'b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })
  })

  describe('ACCOUNT requests', () => {
    it('getById calls the API correctly', async () => {
      const mockGet = jest.fn(() => ({ foo: 'bar' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ACCOUNT.getById('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/account/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(({ foo: 'bar' }))
    })

    it('getById rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ACCOUNT.getById('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('update calls the API correctly', async () => {
      const mockPut = jest.fn(() => ({ foo: 'bar' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ACCOUNT.update('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/account/b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
    })

    it('update rethrows on error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ACCOUNT.update('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' }))
        .rejects.toThrowError()
    })

    it('destroy calls the API correctly', async () => {
      const mockDelete = jest.fn(() => ({}))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ACCOUNT.destroy('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockDelete).toHaveBeenCalledWith('/account/b306c67f-f5cd-4e69-9986-8390188051b3')
    })

    it('destroy rethrows on error', async () => {
      const mockDelete = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ACCOUNT.destroy('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('isImmutable calls the API correctly', async () => {
      const mockGet = jest.fn().mockReturnValueOnce({ id: 'b306c67f-f5cd-4e69-9986-8390188051b3' })
        .mockReturnValue([{ applicationId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ACCOUNT.isImmutable('81e36e15-88d0-41e2-9399-1c7646ecc5aa', 'b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/account/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/application-accounts', 'accountId=b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(true)
    })

    it('isImmutable calls the API correctly - submitted', async () => {
      const mockGet = jest.fn().mockReturnValueOnce({ id: 'b306c67f-f5cd-4e69-9986-8390188051b3', submitted: '2022-09-12T08:12:47+00:00' })
        .mockReturnValue([{ applicationId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ACCOUNT.isImmutable('81e36e15-88d0-41e2-9399-1c7646ecc5aa', 'b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/account/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(true)
    })

    it('isImmutable calls the API correctly - singular', async () => {
      const mockGet = jest.fn().mockReturnValueOnce({ id: 'b306c67f-f5cd-4e69-9986-8390188051b3' })
        .mockReturnValue([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ACCOUNT.isImmutable('81e36e15-88d0-41e2-9399-1c7646ecc5aa', 'b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/account/b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('/application-accounts', 'accountId=b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(false)
    })

    it('isImmutable rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ACCOUNT.isImmutable('81e36e15-88d0-41e2-9399-1c7646ecc5aa', 'b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })
  })

  describe('CONTACT requests by role', () => {
    it('throws with an unknown role', async () => {
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.CONTACT.role('bad')).toThrow()
    })

    it('getByApplicationId calls the API correctly', async () => {
      const mockGet = jest.fn(() => ([{ foo: 'bar' }]))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3')
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
      await expect(() => APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3'))
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
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).create('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
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
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).create('b306c67f-f5cd-4e69-9986-8390188051b3', { foo: 'bar' })
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
      await expect(() => APIRequests.CONTACT.role(ContactRoles.APPLICANT).create('b306c67f-f5cd-4e69-9986-8390188051b3', {}))
        .rejects.toThrowError()
    })

    it('assign calls the API correctly where there is an existing relationship', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([]).mockReturnValue([{
        id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
        contactId: '00ed369a-6765-45e3-bdad-546b774319f5',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPut).toHaveBeenCalledWith('/application-contact/e8387a83-1165-42e6-afab-add01e77bc4c', {
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
        contactRole: 'APPLICANT'
      })
    })

    it('assign calls the API correctly where the relationship is unchanged', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([{
        id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
        contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPut).not.toHaveBeenCalled()
    })

    it('assign calls the API correctly where there is no existing relationship', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([])
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPost).toHaveBeenCalledWith('/application-contact', { applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3', contactId: '2342fce0-3067-4ca5-ae7a-23cae648e45c', contactRole: 'APPLICANT' })
    })

    it('assign calls the API correctly where there are multiple contacts per role/application', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([])
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.CONTACT.role(ContactRoles.AUTHORISED_PERSON).assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
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
      await expect(() => APIRequests.CONTACT.role(ContactRoles.APPLICANT).assign('b306c67f-f5cd-4e69-9986-8390188051b3'))
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
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
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
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
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
      await expect(() => APIRequests.CONTACT.role(ContactRoles.APPLICANT).unAssign('b306c67f-f5cd-4e69-9986-8390188051b3'))
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
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).findByUser('b306c67f-f5cd-4e69-9986-8390188051b3', 'USER')
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
      await expect(() => APIRequests.CONTACT.role(ContactRoles.APPLICANT).findByUser('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('unlink calls the API correctly - with immutable', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn()
        .mockReturnValueOnce([{
          id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
          contactId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
        }])
        .mockReturnValue([{
          id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
          contactId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
        }, {
          id: '8c3b13ef-c2fb-4955-942e-764593cf0ada',
          contactId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '45acb529-70bb-4b8d-8688-ccdec837e5d4'
        }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).unLink('35acb529-70bb-4b8d-8688-ccdec837e5d4')
      expect(mockDelete).toHaveBeenCalledWith('/application-contact/7c3b13ef-c2fb-4955-942e-764593cf0ada')
    })

    it('unlink calls the API correctly - with mutable', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn()
        .mockReturnValueOnce([{
          id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
          contactId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
        }])
        .mockReturnValue([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.CONTACT.role(ContactRoles.APPLICANT).unLink('35acb529-70bb-4b8d-8688-ccdec837e5d4')
      expect(mockDelete).toHaveBeenCalledWith('/application-contact/7c3b13ef-c2fb-4955-942e-764593cf0ada')
      expect(mockDelete).toHaveBeenCalledWith('/contact/412d7297-643d-485b-8745-cc25a0e6ec0a')
    })

    it('unlink rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.CONTACT.role(ContactRoles.APPLICANT).unLink('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })
  })

  describe('ACCOUNT requests BY role', () => {
    it('throws with an unknown role', async () => {
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ACCOUNT.role('bad')).toThrow()
    })

    it('getByApplicationId calls the API correctly', async () => {
      const mockGet = jest.fn(() => ([{ foo: 'bar' }]))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3')
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
      await expect(() => APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).getByApplicationId('b306c67f-f5cd-4e69-9986-8390188051b3'))
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
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).create('b306c67f-f5cd-4e69-9986-8390188051b3')
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
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).create('b306c67f-f5cd-4e69-9986-8390188051b3')
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
      await expect(() => APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).create('b306c67f-f5cd-4e69-9986-8390188051b3'))
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
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
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
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).unAssign('b306c67f-f5cd-4e69-9986-8390188051b3')
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
      await expect(() => APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).unAssign('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })

    it('assign calls the API correctly where there is an existing relationship', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([]).mockReturnValue([{
        id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
        accountId: '00ed369a-6765-45e3-bdad-546b774319f5',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPut).toHaveBeenCalledWith('/application-account/e8387a83-1165-42e6-afab-add01e77bc4c', {
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
        accountId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
        accountRole: 'APPLICANT-ORGANISATION'
      })
    })

    it('assign calls the API correctly where the relationship is unchanged', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([{
        id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
        accountId: '2342fce0-3067-4ca5-ae7a-23cae648e45',
        applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
      }])
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPut).not.toHaveBeenCalled()
    })

    it('assign calls the API correctly where there is no existing relationship', async () => {
      const mockGet = jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([])
      const mockPost = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).assign('b306c67f-f5cd-4e69-9986-8390188051b3', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
      expect(mockPost).toHaveBeenCalledWith('/application-account', { accountId: '2342fce0-3067-4ca5-ae7a-23cae648e45c', accountRole: 'APPLICANT-ORGANISATION', applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3' })
    })

    it('assign rethrows on error', async () => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: jest.fn(() => { throw new Error() })
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).assign('b306c67f-f5cd-4e69-9986-8390188051b3', '6829ad54-bab7-4a78-8ca9-dcf722117a45'))
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
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).findByUser('f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      expect(mockGet).toHaveBeenCalledWith('/accounts', 'userId=f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb&role=APPLICANT-ORGANISATION')
    })

    it('findByUser rethrows on error', async () => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: jest.fn(() => { throw new Error() })
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).findByUser('f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb'))
        .rejects.toThrowError()
    })

    it('unlink calls the API correctly - with immutable', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn()
        .mockReturnValueOnce([{
          id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
          contactId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
        }])
        .mockReturnValue([{
          id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
          contactId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
        }, {
          id: '8c3b13ef-c2fb-4955-942e-764593cf0ada',
          contactId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '45acb529-70bb-4b8d-8688-ccdec837e5d4'
        }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).unLink('35acb529-70bb-4b8d-8688-ccdec837e5d4')
      expect(mockDelete).toHaveBeenCalledWith('/application-account/7c3b13ef-c2fb-4955-942e-764593cf0ada')
    })

    it('unlink calls the API correctly - with mutable', async () => {
      const mockDelete = jest.fn()
      const mockGet = jest.fn()
        .mockReturnValueOnce([{
          id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
          accountId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
        }])
        .mockReturnValue([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).unLink('35acb529-70bb-4b8d-8688-ccdec837e5d4')
      expect(mockDelete).toHaveBeenCalledWith('/application-account/7c3b13ef-c2fb-4955-942e-764593cf0ada')
      expect(mockDelete).toHaveBeenCalledWith('/account/412d7297-643d-485b-8745-cc25a0e6ec0a')
    })

    it('unlink rethrows an error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).unLink('b306c67f-f5cd-4e69-9986-8390188051b3'))
        .rejects.toThrowError()
    })
  })

  describe('ECOLOGIST_EXPERIENCE requests', () => {
    it('getExperienceById calls the API correctly', async () => {
      const mockGet = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById('35acb529-70bb-4b8d-8688-ccdec837e5d4')
      expect(mockGet).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/ecologist-experience')
    })

    it('getExperienceById rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() =>
        APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById('35acb529-70bb-4b8d-8688-ccdec837e5d4'))
        .rejects.toThrowError()
    })

    it('putExperienceById calls the API correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById('35acb529-70bb-4b8d-8688-ccdec837e5d4', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/ecologist-experience', { foo: 'bar' })
    })

    it('putExperienceById rethrows on error', async () => {
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() =>
        APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById('35acb529-70bb-4b8d-8688-ccdec837e5d4'))
        .rejects.toThrowError()
    })

    it('getPreviousLicences calls the API correctly', async () => {
      const mockGet = jest.fn(() => [{ licenceNumber: 'ABBB' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences('35acb529-70bb-4b8d-8688-ccdec837e5d4')
      expect(mockGet).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/previous-licences')
      expect(result).toEqual(['ABBB'])
    })

    it('getPreviousLicences rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences('35acb529-70bb-4b8d-8688-ccdec837e5d4'))
        .rejects.toThrowError()
    })

    it('addPreviousLicence calls the API correctly', async () => {
      const mockPost = jest.fn(() => [{ licenceNumber: 'ABBB' }])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.addPreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'ABBBC')
      expect(mockPost).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/previous-licence', { licenceNumber: 'ABBBC' })
    })

    it('addPreviousLicence rethrows on error', async () => {
      const mockPost = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_EXPERIENCE.addPreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'ABBBC'))
        .rejects.toThrowError()
    })

    it('removePreviousLicence calls the API correctly', async () => {
      const mockGet = jest.fn(() => [{ id: '35acb529-70bb-4b8d-8688-ccdec837e5d4', licenceNumber: 'ABBBC' }])
      const mockDelete = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet,
          delete: mockDelete
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.ECOLOGIST_EXPERIENCE.removePreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'ABBBC')
      expect(mockDelete).toHaveBeenCalledWith('/application/35acb529-70bb-4b8d-8688-ccdec837e5d4/previous-licence/35acb529-70bb-4b8d-8688-ccdec837e5d4')
    })

    it('removePreviousLicence rethrows on error', async () => {
      const mockGet = jest.fn(() => { throw new Error() })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await expect(() => APIRequests.ECOLOGIST_EXPERIENCE.removePreviousLicence('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'ABBBC'))
        .rejects.toThrowError()
    })
  })

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
