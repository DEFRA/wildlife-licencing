jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the artificial sett evidence found functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns artificialSettFoundEvidence from the database', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {
              id: '123456789'
            }
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              artificialSettFoundEvidence: 'evidence will be uploaded'
            }))
          }
        }
      }))

      const { getData } = await import('../artificial-sett-evidence-found.js')
      const result = await getData(request)
      expect(result).toEqual({ artificialSettFoundEvidence: 'evidence will be uploaded' })
    })

    it('returns artificialSettFoundEvidence as undefined if there is no returnId', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc'
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          }
        }
      }))

      const { getData } = await import('../artificial-sett-evidence-found.js')
      const result = await getData(request)
      expect(result).toEqual({ artificialSettFoundEvidence: undefined })
    })
  })

  describe('the setData function', () => {
    it('updates the artificialSettFoundEvidence flag correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'located-artificial-sett': 'evidence found'
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
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              nilReturn: false
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../artificial-sett-evidence-found.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: false, artificialSettFoundEvidence: 'evidence found' })
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
