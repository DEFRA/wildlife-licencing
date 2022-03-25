describe('login page', () => {
  beforeEach(() => jest.resetModules())

  describe('the setData', () => {
    it('submits the user to the authorization cache', async () => {
      // const mockAddUser = jest.fn()
      // jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { addUser: mockAddUser } } }))
      const mockFindUser = jest.fn(() => ({ username: 'flintstone' }))
      const mockSetAuthData = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { findUserByName: mockFindUser } } }))
      const { setData } = await import('../login.js')
      await setData({ cache: () => ({ setAuthData: mockSetAuthData }), payload: { 'user-id': 'a.b@email.com' } })
      expect(mockSetAuthData).toHaveBeenCalledWith({ username: 'flintstone' })
    })
  })

  describe('the validator', () => {
    it('throws an exception on an empty username', async () => {
      const { validator } = await import('../login.js')
      await expect(() => validator({ 'user-id': '' })).rejects.toThrowError()
    })

    it('throws an exception on an invalid email address', async () => {
      const { validator } = await import('../login.js')
      await expect(() => validator({ 'user-id': 'a.b@notvalid' })).rejects.toThrowError()
    })

    it('throws an exception on an not-found email address', async () => {
      const mockFindUser = jest.fn(() => null)
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { findUserByName: mockFindUser } } }))
      const { validator } = await import('../login.js')
      await expect(validator({ 'user-id': 'a.b@email.com' })).rejects.toThrowError()
    })

    it('completes successfully on an found email address', async () => {
      const mockFindUser = jest.fn(() => ({ username: 'flintstone' }))
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { findUserByName: mockFindUser } } }))
      const { validator } = await import('../login.js')
      await expect(validator({ 'user-id': 'a.b@email.com' })).resolves
    })
  })

  describe('the completion', () => {
    it('returns the applications page', async () => {
      const { completion } = await import('../login.js')
      const result = await completion()
      expect(result).toBe('/applications')
    })
  })
})
