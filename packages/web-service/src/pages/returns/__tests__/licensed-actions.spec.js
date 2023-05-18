jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Licensed Actions functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    const mockSetData = jest.fn()
    it('returns the nilReturn as true', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {
              id: '123456789'
            }
          }),
          setData: mockSetData
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              nilReturn: true
            }))
          }
        }
      }))

      const { getData } = await import('../licensed-actions.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
      expect(mockSetData).toHaveBeenCalled()
    })

    it('returns the nilReturn as undefined', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f',
            licenceId: '2280-4ea5-ad72'
          }),
          setData: mockSetData
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '123-AbEF-67'
            }]))
          }
        }
      }))

      const { getData } = await import('../licensed-actions.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: undefined })
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the setData function', () => {
    it('updates the nilReturn flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'yes-no': 'no'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'ABC-567-GHU',
            returns: {
              id: '123456789'
            }
          }),
          setData: mockSetData
        })
      }

      const mockUpdateLicenceReturn = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              whyNil: 'development issues',
              completedWithinLicenceDates: true,
              whyNotCompletedWithinLicenceDates: 'delay',
              nilReturn: true
            })),
            getLicenceReturns: jest.fn(() => []),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../licensed-actions.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { whyNil: 'development issues', nilReturn: false, completedWithinLicenceDates: true, whyNotCompletedWithinLicenceDates: 'delay' })
      expect(mockSetData).toHaveBeenCalled()
    })

    it('stores the nilReturn flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'yes-no': 'no'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'DEF-7420-NGVR',
            licenceNumber: '26a3e94f-7420-NGVR'
          }),
          setData: mockSetData
        })
      }

      const mockCreateLicenceReturn = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturns: jest.fn(() => []),
            createLicenceReturn: mockCreateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../licensed-actions.js')
      await setData(request)
      expect(mockCreateLicenceReturn).toHaveBeenCalledWith('DEF-7420-NGVR', { returnReferenceNumber: '26a3e94f-7420-NGVR-ROA1', nilReturn: false })
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the completion function', () => {
    it('redirects to the why Nil page page if the answer is no', async () => {
      const { completion } = await import('../licensed-actions.js')
      const request = {
        payload: { 'yes-no': 'no' }
      }
      const result = await completion(request)
      expect(result).toEqual('/why-nil')
    })

    it('redirects to outcome page if the answer is yes', async () => {
      const { completion } = await import('../licensed-actions.js')
      const request = {
        payload: { 'yes-no': 'yes' }
      }
      const result = await completion(request)
      expect(result).toEqual('/outcome')
    })
  })
})
