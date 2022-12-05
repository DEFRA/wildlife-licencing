import { AccountRoles } from '../../pages/contact/common/contact-roles.js'

jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests account service', () => {
  describe('ACCOUNT requests', () => {
    beforeEach(() => jest.resetModules())

    it('findAllAccountApplicationRolesByUser calls the API correctly', async () => {
      const mockGet = jest.fn(() => ([{ foo: 'bar' }]))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          get: mockGet
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.ACCOUNT.findAllAccountApplicationRolesByUser('b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(mockGet).toHaveBeenCalledWith('application-accounts/accounts', 'userId=b306c67f-f5cd-4e69-9986-8390188051b3')
      expect(result).toEqual(([{ foo: 'bar' }]))
    })

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
  })

  describe('ACCOUNT requests BY role', () => {
    beforeEach(() => jest.resetModules())

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
  })
})
