jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Licensed Actions functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the nilReturn', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            returns: {
              returnId: '123456789',
              licenceId: ''
            }
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '123456-AbdEF-4567'
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
            returns: {
              returnId: '123456789',
              licenceId: 'ABC-567-GHU'
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
            returns: {
              licenceId: 'DEF-7420-NGVR'
            }
          }),
          setData: mockSetData
        })
      }

      const mockCreateLicenceReturn = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            createLicenceReturn: mockCreateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../licensed-actions.js')
      await setData(request)
      expect(mockCreateLicenceReturn).toHaveBeenCalledWith('DEF-7420-NGVR', { nilReturn: false })
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
