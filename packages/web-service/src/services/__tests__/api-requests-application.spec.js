import { tagStatus } from '../status-tags.js'

jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests application service', () => {
  describe('APPLICATION requests', () => {
    beforeEach(() => jest.resetModules())
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

    it('update calls the API connector correctly', async () => {
      const mockPut = jest.fn(() => ({ id: 'applicationId' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICATION.update('9d62e5b8-9c77-ec11-8d21-000d3a87431b', { detailsOfConviction: 'detailsOfConviction' })
      expect(mockPut).toHaveBeenCalledWith('/application/9d62e5b8-9c77-ec11-8d21-000d3a87431b', {
        detailsOfConviction: 'detailsOfConviction'
      })
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

    describe('the tag functions', () => {
      beforeEach(() => jest.resetModules())
      it('the set tag function calls the the API correctly if the tag is present', async () => {
        const mockPut = jest.fn()
        const mockGet = jest.fn(() => (
          {
            applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
          }
        ))
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            put: mockPut,
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').set({ tag: 'setts', tagState: tagStatus.COMPLETE })
        expect(mockPut).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3', {
          applicationTags: expect.arrayContaining([{ tag: 'setts', tagState: tagStatus.COMPLETE }]), applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
        })
      })

      it('the set tag function throws error if the tag state does not exist', async () => {
        const { APIRequests } = await import('../api-requests.js')
        await expect(async () =>
          await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').set({ tag: 'ecologist-experience', tagState: 'blocked' })
        ).rejects.toThrowError()
      })

      it('the set tag function ignores duplicate tag updates', async () => {
        const mockGet = jest.fn(() => ({
          applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
          applicationTags: [{ tag: 'ecologist-experience', tagState: tagStatus.COMPLETE }]
        }))
        const mockPut = jest.fn()
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            put: mockPut,
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').set({ tag: 'ecologist-experience', tagState: tagStatus.COMPLETE })
        expect(mockPut).not.toHaveBeenCalledWith()
      })

      it('the get tag function calls the the API correctly if the tags present', async () => {
        const mockGet = jest.fn(() => (
          {
            applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
            applicationTags: [
              { tag: 'ecologist-experience', tagState: tagStatus.COMPLETE }
            ]
          }
        ))
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        const result = await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').get('ecologist-experience')
        expect(result).toBeTruthy()
        expect(result).toEqual('complete')
      })

      it('the get tag function calls the the API correctly if the tags not present', async () => {
        const mockGet = jest.fn(() => (
          {
            applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
          }
        ))
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        const result = await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').get('missingSTRING')
        expect(result).toEqual('not-started')
      })

      it('the set tag function calls the the API correctly if tag present', async () => {
        const mockGet = jest.fn(() => (
          {
            applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3',
            applicationTags: [
              { tag: 'ecologist-experience', tagState: tagStatus.COMPLETE },
              { tag: 'setts', tagState: tagStatus.IN_PROGRESS }
            ]
          }
        ))
        const mockPut = jest.fn()
        jest.doMock('@defra/wls-connectors-lib', () => ({
          API: {
            get: mockGet,
            put: mockPut
          }
        }))
        const { APIRequests } = await import('../api-requests.js')
        await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').set({ tag: 'setts', tagState: tagStatus.COMPLETE })
        expect(mockPut).toHaveBeenCalledWith('/application/b306c67f-f5cd-4e69-9986-8390188051b3',
          {
            applicationTags: [
              { tag: 'ecologist-experience', tagState: tagStatus.COMPLETE },
              { tag: 'setts', tagState: tagStatus.COMPLETE }
            ],
            applicationId: 'b306c67f-f5cd-4e69-9986-8390188051b3'
          })
      })
    })

    it('the getAll tag function calls the API', async () => {
      const mockGet = jest.fn(() => {
        return {
          applicationTags: []
        }
      })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').getAll('tsg-2')
      expect(mockGet).toHaveBeenCalledTimes(1)
    })

    it('the getAll tag function returns the applicationTags from the application object', async () => {
      const mockGet = jest.fn(() => {
        return {
          applicationTags: [
            { tag: 'setts', tagStatus: 'not-started' }
          ]
        }
      })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      expect(await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').getAll('tsg-2')).toEqual([{ tag: 'setts', tagStatus: 'not-started' }])
    })

    it('the getAll tag function returns a default empty array if no tags present', async () => {
      const mockGet = jest.fn(() => {
        return {}
      })
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      expect(await APIRequests.APPLICATION.tags('b306c67f-f5cd-4e69-9986-8390188051b3').getAll('tsg-2')).toEqual([])
    })
  })
})
