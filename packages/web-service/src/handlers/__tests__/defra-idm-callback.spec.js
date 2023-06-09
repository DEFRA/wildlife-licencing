import { DEFRA_IDM_CALLBACK } from '../../uris.js'

describe('the defra IDM callback handler functions', () => {
  beforeEach(() => jest.resetModules())

  it('correctly calls the DEFRA_ID authorization function', async () => {
    const mockFetchToken = jest.fn().mockReturnValue('encrypted')
    const mockSetData = jest.fn()
    const mockSetAuthData = jest.fn()
    const mockVerifyToken = jest.fn().mockReturnValue({ contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      DEFRA_ID: {
        fetchToken: mockFetchToken,
        verifyToken: mockVerifyToken
      }
    }))
    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        USER: {
          getById: () => ({ id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
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
    expect(mockSetAuthData).toHaveBeenCalledWith({ contactId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
    expect(mockSetData).toHaveBeenCalledWith({ userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' })
  })
  //  await defraIdmCallback.handler(request, h)
})
