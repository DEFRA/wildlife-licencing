jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests user service', () => {
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

    it('update calls the API connector correctly', async () => {
      const mockPut = jest.fn(() => ({ username: 'Keith Moon' }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      const result = await APIRequests.USER.update('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { foo: 'bar' })
      expect(mockPut).toHaveBeenCalledWith('/user/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { foo: 'bar' })
      expect(result).toEqual({ username: 'Keith Moon' })
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
  })

  describe('ORGANISATION requests', () => {
    it('updateOrganisation calls the API connector correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.USER.updateOrganisation('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { name: 'acme' })
      expect(mockPut).toHaveBeenCalledWith('/organisation/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { name: 'acme' })
    })

    it('updateUserOrganisation calls the API connector correctly', async () => {
      const mockPut = jest.fn()
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          put: mockPut
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.USER.updateUserOrganisation('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', {
        userId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
        organisationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10',
        relationship: 'employee'
      })
      expect(mockPut).toHaveBeenCalledWith('/user-organisation/56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', {
        userId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
        organisationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10',
        relationship: 'employee'
      })
    })
  })
})
