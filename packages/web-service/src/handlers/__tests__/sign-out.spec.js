describe('the sign-out pages', () => {
  beforeEach(() => jest.resetModules())
  it('deletes the auth cache and redirects to the IDM sign-out', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      DEFRA_ID: {
        getEndSession: () => '/end'
      }
    }))
    const { signOut } = await import('../sign-out.js')
    const mockRedirect = jest.fn()
    const mockSetAuthData = jest.fn()
    await signOut.handler({
      cache: () => ({ setAuthData: mockSetAuthData })
    }, {
      redirect: mockRedirect
    })
    expect(mockSetAuthData).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/end')
  })
})
