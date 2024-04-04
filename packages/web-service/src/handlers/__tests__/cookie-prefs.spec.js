describe('the cookie-prefs handler function', () => {
  beforeEach(() => jest.resetModules())

  it('if not signed in correctly calls the API and saves the cookie data in the cache', async () => {
    const mockRedirect = jest.fn()
    const mockGetData = jest.fn(() => null)
    const mockSetData = jest.fn()

    const request = {
      query: { analytics: 'yes' },
      info: { referrer: 'http://0.0.0.0/foo' },
      cache: () => ({
        getData: mockGetData,
        setData: mockSetData
      })
    }

    const cookiePrefs = (await import('../cookie-prefs.js')).default
    await cookiePrefs(request, { redirect: mockRedirect })
    expect(mockRedirect).toHaveBeenCalledWith(new URL('http://0.0.0.0/foo'))
  })

  it('if signed in correctly calls the API and saves the cookie data', async () => {
    const mockGetById = jest.fn(() => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' }))
    const mockUpdate = jest.fn()
    const mockRedirect = jest.fn()
    const mockGetData = jest.fn(() => ({
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
    }))
    const mockSetData = jest.fn()

    const request = {
      query: { analytics: 'yes' },
      info: { referrer: 'http://0.0.0.0/foo' },
      cache: () => ({
        getData: mockGetData,
        setData: mockSetData
      })
    }

    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        USER: {
          getById: mockGetById,
          update: mockUpdate
        }
      }
    }))
    const cookiePrefs = (await import('../cookie-prefs.js')).default
    await cookiePrefs(request, { redirect: mockRedirect })
    expect(mockUpdate).toHaveBeenCalledWith('6829ad54-bab7-4a78-8ca9-dcf722117a45',
      { cookiePrefs: { analytics: true }, id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
  })

  it('updates cookiePrefs if hideMessage query parameter is truthy and user is signed in', async () => {
    const mockGetById = jest.fn(() => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', cookiePrefs: {} }))
    const mockUpdate = jest.fn()
    const mockRedirect = jest.fn()
    const mockGetData = jest.fn(() => ({
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
    }))
    const mockSetData = jest.fn()

    const request = {
      query: { hideMessage: 'yes' },
      info: { referrer: 'http://0.0.0.0/foo' },
      cache: () => ({
        getData: mockGetData,
        setData: mockSetData
      })
    }

    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        USER: {
          getById: mockGetById,
          update: mockUpdate
        }
      }
    }))
    const cookiePrefs = (await import('../cookie-prefs.js')).default
    await cookiePrefs(request, { redirect: mockRedirect })
    expect(mockUpdate).toHaveBeenCalledWith('6829ad54-bab7-4a78-8ca9-dcf722117a45',
      { cookiePrefs: { hideMessage: true }, id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
  })
})