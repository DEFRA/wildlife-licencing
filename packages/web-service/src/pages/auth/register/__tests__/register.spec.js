describe('registration page', () => {
  beforeEach(() => jest.resetModules())

  describe('the setData', () => {
    it('submits the user to the API', async () => {
      const mockAddUser = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { create: mockAddUser } } }))
      const { setData } = await import('../register.js')
      await setData({ payload: { 'user-id': 'a.b@email.com' } })
      expect(mockAddUser).toHaveBeenCalledWith('a.b@email.com')
    })
  })

  describe('the validator', () => {
    it('throws an exception on an empty username', async () => {
      const { validator } = await import('../register.js')
      await expect(() => validator({ 'user-id': '' })).rejects.toThrowError()
    })

    it('throws an exception on an invalid email address', async () => {
      const { validator } = await import('../register.js')
      await expect(() => validator({ 'user-id': 'a.b@notvalid' })).rejects.toThrowError()
    })

    it('throws an exception on a found email address', async () => {
      const mockFindUser = jest.fn(() => ({ username: 'flintstone' }))
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { findByName: mockFindUser } } }))
      const { validator } = await import('../register.js')
      await expect(validator({ 'user-id': 'a.b@email.com' })).rejects.toThrowError()
    })

    it('completes successfully on a not-found email address', async () => {
      const mockFindUser = jest.fn(() => null)
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { findByName: mockFindUser } } }))
      const { validator } = await import('../register.js')
      await expect(validator({ 'user-id': 'a.b@email.com' })).resolves
    })
  })

  describe('the completion', () => {
    it('returns the login page', async () => {
      const { completion } = await import('../register.js')
      const mockClearPageData = jest.fn()
      const result = await completion({ cache: () => ({ clearPageData: mockClearPageData }) })
      expect(result).toBe('/login')
      expect(mockClearPageData).toHaveBeenCalledTimes(2)
    })
  })
})
