describe('cookie-info page', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData', () => {
    it('returns null if cookie preference not set', async () => {
      const mockSetData = jest.fn()
      const request = {
        info: { referrer: 'http://0.0.0.0/xyz' },
        cache: () => ({
          getData: () => ({}),
          setData: mockSetData
        })
      }
      const { getData } = await import('../cookie-info.js')
      const result = await getData(request)
      expect(result).toBeNull()
      expect(mockSetData).toHaveBeenCalledWith({ cookiesReferrer: '/xyz' })
    })

    it('returns the cookie preference from the cache', async () => {
      const request = {
        info: { referrer: 'http://0.0.0.0/xyz' },
        cache: () => ({
          setData: jest.fn(),
          getData: () => ({
            cookies: { analytics: false }
          })
        })
      }
      const { getData } = await import('../cookie-info.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'no' })
    })

    it('returns the cookie preference from the database', async () => {
      const request = {
        info: { referrer: 'http://0.0.0.0/xyz' },
        cache: () => ({
          setData: jest.fn(),
          getData: () => ({
            userId: 'e8387a83-1165-42e6-afab-add01e77bc4c'
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: () => ({ cookiePrefs: { analytics: true } })
          }
        }
      }))
      const { getData } = await import('../cookie-info.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })

    it('does not capture the referrer, if the referrer is cookie-info', async () => {
      const mockSetData = jest.fn()
      const request = {
        info: { referrer: 'https://host/cookie-info' },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({ cookiesReferrer: '/xyz' })
        })
      }
      const { getData } = await import('../cookie-info.js')
      await getData(request)
      expect(mockSetData).toHaveBeenCalledWith({ cookiesReferrer: '/xyz' })
    })
  })

  describe('the setData', () => {
    it('sets the cookie preference in the cache', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({})
        })
      }
      const { setData } = await import('../cookie-info.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        cookies: {
          analytics: false
        }
      })
    })

    it('sets the cookie preference in the database', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: () => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c' }),
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          setData: jest.fn(),
          getData: () => ({ userId: 'e8387a83-1165-42e6-afab-add01e77bc4c' })
        })
      }
      const { setData } = await import('../cookie-info.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('e8387a83-1165-42e6-afab-add01e77bc4c',
        expect.objectContaining({ cookiePrefs: { analytics: false } }))
    })
  })

  describe('the completion', () => {
    it('redirects to the captured referrer', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ cookiesReferrer: '/xyz' })
        })
      }
      const { completion } = await import('../cookie-info.js')
      const result = await completion(request)
      expect(result).toEqual('/xyz')
    })
  })
})
