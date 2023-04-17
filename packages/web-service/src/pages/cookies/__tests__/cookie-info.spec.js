describe('cookie-info page', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData', () => {
    it('returns null if cookie preference not set', async () => {
      const request = {
        cache: () => ({
          getData: () => ({})
        })
      }
      const { getData } = await import('../cookie-info.js')
      const result = await getData(request)
      expect(result).toBeNull()
    })

    it('returns the cookie preference from the cache', async () => {
      const request = {
        cache: () => ({
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
        cache: () => ({
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
    it('returns the referrer if not the cookie-info page', async () => {
      const { completion } = await import('../cookie-info.js')
      const result = await completion({ info: { referrer: 'http://0.0.0.0/xyz' } })
      expect(result).toEqual('/xyz')
    })

    it('returns the applications if the referrer is the cookie-info page', async () => {
      const { completion } = await import('../cookie-info.js')
      const result = await completion({ info: { referrer: 'http://0.0.0.0/cookie-info' } })
      expect(result).toEqual('/applications')
    })
  })
})
