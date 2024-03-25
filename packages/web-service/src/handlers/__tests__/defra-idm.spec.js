describe('the defra IDM sign-in handler function', () => {
  beforeEach(() => jest.resetModules())

  it('correctly calls the DEFRA_ID authorization function', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      DEFRA_ID: {
        getAuthorizationUrl: () => 'https://authorization'
      }
    }))
    const { signIn } = await import('../defra-idm.js')
    const h = {
      redirect: jest.fn()
    }
    await signIn.handler(null, h)
    expect(h.redirect).toHaveBeenCalledWith('https://authorization')
  })
})
