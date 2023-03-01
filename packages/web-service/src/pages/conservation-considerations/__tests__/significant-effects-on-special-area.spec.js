jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the significant effects on special area functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the effectsOnSpecialAreas flag on the application', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: jest.fn(() => ({
              effectsOnSpecialAreas: 'NO'
            }))
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { getData } = await import('../significant-effects-on-special-area.js')
      const result = await getData(request)
      expect(result).toEqual({ effects: 'NO' })
    })
  })

  describe('the setData function', () => {
    it('set the effectsOnSpecialAreas flag on the application', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            update: mockUpdate,
            getById: jest.fn(() => ({
              effectsOnSpecialAreas: 'NO'
            }))
          }
        }
      }))
      const request = {
        payload: { effects: 'YES' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { setData } = await import('../significant-effects-on-special-area.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { effectsOnSpecialAreas: 'YES' })
    })
  })

  describe('the completion function', () => {
    it('if yes redirects to the special site name', async () => {
      const { completion } = await import('../significant-effects-on-special-area.js')
      const request = {
        payload: { effects: 'YES' }
      }
      const result = await completion(request)
      expect(result).toEqual('/special-area-site-name')
    })

    it('if no redirects to the check page', async () => {
      const { completion } = await import('../significant-effects-on-special-area.js')
      const request = {
        payload: { effects: 'NO' }
      }
      const result = await completion(request)
      expect(result).toEqual('/sssi-check-answers')
    })

    it('if no advice redirects to the check page', async () => {
      const { completion } = await import('../significant-effects-on-special-area.js')
      const request = {
        payload: { effects: 'NO-ADVICE' }
      }
      const result = await completion(request)
      expect(result).toEqual('/sssi-check-answers')
    })
  })
})
