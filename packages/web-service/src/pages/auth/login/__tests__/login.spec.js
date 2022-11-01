describe('login page', () => {
  beforeEach(() => jest.resetModules())

  describe('the setData', () => {
    it('submits the user to the authorization cache', async () => {
      const mockFindUser = jest.fn(() => ({ username: 'flintstone' }))
      const mockSetAuthData = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { findByName: mockFindUser } } }))
      const { setData } = await import('../login.js')
      await setData({
        cache: () => ({ setAuthData: mockSetAuthData, setData: jest.fn(), getData: jest.fn() }),
        payload: { username: 'a.b@email.com' }
      })
      expect(mockSetAuthData).toHaveBeenCalledWith({ username: 'flintstone' })
    })
  })

  describe('the validator', () => {
    it('throws an exception on an empty username', async () => {
      const { validator } = await import('../login.js')
      await expect(() => validator({ username: '', password: '11Aaaaaa!' })).rejects.toThrowError()
    })

    it('throws an exception on an invalid email address', async () => {
      const { validator } = await import('../login.js')
      await expect(() => validator({ username: 'a.b@notvalid', password: '11Aaaaaa!' })).rejects.toThrowError()
    })

    it('throws an exception on a not-found email address/password', async () => {
      const mockAuthenticate = jest.fn().mockReturnValue(false)
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { authenticate: mockAuthenticate } } }))
      const { validator } = await import('../login.js')
      await expect(validator({ username: 'a.b@email.com', password: '11Aaaaaa!' })).rejects.toThrowError()
    })

    it('completes successfully on an found email address', async () => {
      const mockAuthenticate = jest.fn().mockReturnValue(true)
      jest.doMock('../../../../services/api-requests.js', () => ({ APIRequests: { USER: { authenticate: mockAuthenticate } } }))
      const { validator } = await import('../login.js')
      await expect(validator({ username: 'a.b@email.com', password: '11Aaaaaa!' })).resolves
    })
  })

  describe('the checkData', () => {
    it('returns the tasklist page if the user is logged in and there is an applicationId', async () => {
      const { checkData } = await import('../login.js')
      const mockRedirect = jest.fn()
      await checkData({
        cache: () => ({
          getData: jest.fn(() => ({
            userId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
            applicationId: '7b1215e5-5426-4ef9-b412-a3df1b9c29be'
          }))
        })
      }, { redirect: mockRedirect })
      expect(mockRedirect).toHaveBeenCalledWith('/tasklist')
    })

    it('returns the applications page page if the user is logged in and there is no applicationId', async () => {
      const { checkData } = await import('../login.js')
      const mockRedirect = jest.fn()
      await checkData({
        cache: () => ({
          getData: jest.fn(() => ({
            userId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732'
          }))
        })
      }, { redirect: mockRedirect })
      expect(mockRedirect).toHaveBeenCalledWith('/applications')
    })

    it('returns null if the userId is not set', async () => {
      const { checkData } = await import('../login.js')
      const result = await checkData({
        cache: () => ({
          getData: jest.fn(() => ({}))
        })
      }, { })
      expect(result).toBeNull()
    })
  })

  describe('the completion', () => {
    it('returns the tasklist page an applicationId is set and the user is authenticated', async () => {
      const { completion } = await import('../login.js')
      const result = await completion({
        auth: {
          isAuthenticated: true
        },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '7b1215e5-5426-4ef9-b412-a3df1b9c29be'
          }))
        })
      })
      expect(result).toBe('/tasklist')
    })

    it('returns the tasklist page if the user is not authenticated', async () => {
      const { completion } = await import('../login.js')
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
      const { completion } = await import('../login.js')
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

    it('returns the page requested', async () => {
      const { completion } = await import('../login.js')
      const result = await completion({
        auth: {
          isAuthenticated: true
        },
        cache: () => ({ getData: jest.fn(() => ({ navigation: { requestedPage: '/page' } })) })
      })
      expect(result).toBe('/page')
    })
  })
})
