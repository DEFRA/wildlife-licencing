describe('The user-role', () => {
  beforeEach(() => jest.resetModules())
  it('setData works as expected', async () => {
    const { setData } = await import('../user-role.js')
    const mockSetData = jest.fn()
    const request = {
      payload: { 'user-role': 'a role' },
      cache: () => ({
        getData: () => ({}),
        setData: mockSetData
      })
    }
    await setData(request)
    expect(mockSetData).toHaveBeenCalledWith({ applicationRole: 'a role' })
  })
})
