jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the necessary for managing special area functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the user permission flag from the SSSI site', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: jest.fn(() => ({
              necessaryToManageSpecialArea: true
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
      const { getData } = await import('../necessary-for-managing-special-area.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            update: mockUpdate,
            getById: jest.fn(() => ({
              necessaryToManageSpecialArea: false
            }))
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { setData } = await import('../necessary-for-managing-special-area.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { necessaryToManageSpecialArea: true })
    })
  })

  describe('the completion function', () => {
    it('if yes redirects to the owner permission details', async () => {
      const { completion } = await import('../necessary-for-managing-special-area.js')
      const request = {
        payload: { 'yes-no': 'yes' }
      }
      const result = await completion(request)
      expect(result).toEqual('/necessary-site-name')
    })

    it('if no redirects to the advice from natural england page', async () => {
      const { completion } = await import('../necessary-for-managing-special-area.js')
      const request = {
        payload: { 'yes-no': 'no' }
      }
      const result = await completion(request)
      expect(result).toEqual('/significant-effects-on-special-area')
    })
  })
})
