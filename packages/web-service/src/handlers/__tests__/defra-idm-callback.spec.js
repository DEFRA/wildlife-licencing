describe('the defra IDM callback handler function', () => {
  beforeEach(() => jest.resetModules())

  it('correctly calls the DEFRA_ID authorization function', async () => {
    const mockFetchToken = jest.fn().mockReturnValue('token')
    const mockVerifyToken = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      DEFRA_ID: {
        fetchToken: mockFetchToken,
        verifyToken: mockVerifyToken
      }
    }))
    const { defraIdmCallback } = await import('../defra-idm-callback.js')

    const request = {
      query: {
        code: '123'
      }
    }
    const h = {
      redirect: jest.fn()
    }
    await defraIdmCallback.handler(request, h)
    expect(mockFetchToken).toHaveBeenCalledWith('123')
    expect(mockVerifyToken).toHaveBeenCalledWith('token')
    expect(h.redirect).toHaveBeenCalledWith('/which-species')
  })
})
