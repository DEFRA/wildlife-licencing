describe('the sign-out pages', () => {
  it('the handler unsets the session cookie and returns the sign-out view', async () => {
    const { signOut } = await import('../sign-out.js')
    const mockUnstate = jest.fn()
    const mockView = jest.fn()
    const h = {
      unstate: mockUnstate,
      view: mockView
    }
    await signOut.handler({}, h)
    expect(mockUnstate).toHaveBeenCalledWith('sid')
    expect(mockView).toHaveBeenCalledWith('sign-out', {})
  })
})
