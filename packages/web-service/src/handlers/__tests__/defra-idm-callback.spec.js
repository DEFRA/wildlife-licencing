import { DEFRA_IDM_CALLBACK } from '../../uris.js'

describe('the defra IDM callback handler functions', () => {
  beforeEach(() => jest.resetModules())

  it('correctly calls the DEFRA_ID authorization function and sets found user', async () => {
    const mockFetchToken = jest.fn().mockReturnValue('encrypted')
    const mockSetData = jest.fn()
    const mockSetAuthData = jest.fn()
    const mockRequestUserDetails = jest.fn()
    const mockVerifyToken = jest.fn().mockReturnValue({
      contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      relationships: [],
      roles: []
    })
    const mockGetUser = jest.fn().mockReturnValue({
      id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      uniqueReference: '1223',
      email: 'a.b@email.com',
      firstName: 'Graham',
      lastName: 'Willis'
    })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      DEFRA_ID: {
        fetchToken: mockFetchToken,
        verifyToken: mockVerifyToken
      }
    }))
    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        USER: {
          getById: mockGetUser,
          requestUserDetails: mockRequestUserDetails
        }
      }
    })
    )
    const { defraIdmCallbackPreAuth } = await import('../defra-idm-callback.js')

    const request = {
      path: DEFRA_IDM_CALLBACK.uri,
      cache: () => ({
        getData: () => ({ }),
        setAuthData: mockSetAuthData,
        setData: mockSetData
      }),
      query: {
        code: '123'
      }
    }
    const h = {
      redirect: jest.fn()
    }
    await defraIdmCallbackPreAuth(request, h)
    expect(mockFetchToken).toHaveBeenCalledWith('123')
    expect(mockVerifyToken).toHaveBeenCalledWith('encrypted')
    expect(mockRequestUserDetails).toHaveBeenCalledWith('81e36e15-88d0-41e2-9399-1c7646ecc5aa')
    expect(mockSetAuthData).toHaveBeenCalledWith({ contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa', relationships: [], roles: [] })
    expect(mockSetData).toHaveBeenCalledWith({ userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
    expect(mockGetUser).toHaveBeenCalledWith('81e36e15-88d0-41e2-9399-1c7646ecc5aa')
  })

  it('correctly calls the DEFRA_ID authorization function and sets new user', async () => {
    const mockFetchToken = jest.fn().mockReturnValue('encrypted')
    const mockSetData = jest.fn()
    const mockSetAuthData = jest.fn()
    const mockRequestUserDetails = jest.fn()
    const mockRequestOrganisationDetails = jest.fn()
    const mockVerifyToken = jest.fn().mockReturnValue({
      contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      uniqueReference: '1223',
      email: 'a.b@email.com',
      firstName: 'Graham',
      lastName: 'Willis',
      relationships: ['244c4959-0d09-ee11-8f6e-6045bd905113:fe4b4959-0d09-ee11-8f6e-6045bd905113:17 HENLEAZE ROAD MANAGEMENT COMPANY LIMITED:0:Employee:0'],
      roles: ['244c4959-0d09-ee11-8f6e-6045bd905113:fe4b4959-0d09-ee11-8f6e-6045bd905113:17 HENLEAZE ROAD MANAGEMENT COMPANY LIMITED:0:Employee:0']
    })
    const mockCreateUser = jest.fn()
    const mockUpdateOrganisation = jest.fn()
    const mockUpdateUserOrganisation = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      DEFRA_ID: {
        fetchToken: mockFetchToken,
        verifyToken: mockVerifyToken
      }
    }))
    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        USER: {
          getById: () => null,
          createIDM: mockCreateUser,
          updateOrganisation: mockUpdateOrganisation,
          updateUserOrganisation: mockUpdateUserOrganisation,
          requestUserDetails: mockRequestUserDetails,
          requestOrganisationDetails: mockRequestOrganisationDetails
        }
      }
    })
    )
    const { defraIdmCallbackPreAuth } = await import('../defra-idm-callback.js')

    const request = {
      path: DEFRA_IDM_CALLBACK.uri,
      cache: () => ({
        getData: () => ({ }),
        setAuthData: mockSetAuthData,
        setData: mockSetData
      }),
      query: {
        code: '123'
      }
    }
    const h = {
      redirect: jest.fn()
    }
    await defraIdmCallbackPreAuth(request, h)
    expect(mockFetchToken).toHaveBeenCalledWith('123')
    expect(mockVerifyToken).toHaveBeenCalledWith('encrypted')
    expect(mockSetAuthData).toHaveBeenCalledWith(expect.objectContaining({
      contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      email: 'a.b@email.com',
      firstName: 'Graham',
      lastName: 'Willis',
      uniqueReference: '1223'
    }))
    expect(mockRequestUserDetails).toHaveBeenCalledWith('81e36e15-88d0-41e2-9399-1c7646ecc5aa')
    expect(mockSetData).toHaveBeenCalledWith({ userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
    expect(mockCreateUser).toHaveBeenCalledWith('81e36e15-88d0-41e2-9399-1c7646ecc5aa', { contactDetails: { email: 'a.b@email.com' }, fullName: 'Graham Willis', username: '1223' })
    expect(mockUpdateOrganisation).toHaveBeenCalledWith('fe4b4959-0d09-ee11-8f6e-6045bd905113', { name: '17 HENLEAZE ROAD MANAGEMENT COMPANY LIMITED' })
    expect(mockUpdateUserOrganisation).toHaveBeenCalledWith('244c4959-0d09-ee11-8f6e-6045bd905113', { organisationId: 'fe4b4959-0d09-ee11-8f6e-6045bd905113', relationship: 'Employee', userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
    expect(mockRequestOrganisationDetails).toHaveBeenCalledWith('fe4b4959-0d09-ee11-8f6e-6045bd905113')
  })

  describe('the completion', () => {
    it('returns the tasklist page an applicationId is set and the user is authenticated', async () => {
      const { completion } = await import('../defra-idm-callback.js')
      const result = await completion({
        auth: {
          isAuthenticated: true
        },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '7b1215e5-5426-4ef9-b412-a3df1b9c29be',
            applicationRole: 'APPLICANT'
          }))
        })
      })
      expect(result).toBe('/tasklist')
    })

    it('returns the tasklist page if the user is not authenticated', async () => {
      const { completion } = await import('../defra-idm-callback.js')
      const result = await completion({
        auth: {
          isAuthenticated: false
        },
        cache: () => ({
          getData: jest.fn(() => ({}))
        })
      })
      expect(result).toBe('/tasklist')
    })

    it('returns the applications page if no applicationId is set and the user is authenticated', async () => {
      const { completion } = await import('../defra-idm-callback.js')
      const result = await completion({
        auth: {
          isAuthenticated: true
        },
        cache: () => ({
          getData: jest.fn(() => ({}))
        })
      })
      expect(result).toBe('/applications')
    })
  })

  it('call the handler', async () => {
    const { defraIdmCallback } = await import('../defra-idm-callback.js')
    await expect(() => defraIdmCallback.handler({
      auth: { isAuthenticated: () => true },
      cache: () => ({ getData: () => ({}) })
    }, { redirect: jest.fn() })).not.toThrowError()
  })
})
