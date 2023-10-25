import { setData } from '../returns-upload'
import { APIRequests } from '../../../services/api-requests.js'

jest.mock('../../../services/api-requests.js')

describe('Returns upload functions', () => {
  beforeEach(() => jest.resetModules())
  describe('the getData function', () => {
    it('returns yesNo as no when a value has been set', async () => {
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
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              returnsUpload: false
            }))
          }
        }
      }))

      const { getData } = await import('../returns-upload.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'no' })
    })

    it('returns yesNo as undefined when no value has been set', async () => {
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
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({}))
          }
        }
      }))

      const { getData } = await import('../returns-upload.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: undefined })
    })
  })
  describe('setData', () => {
    let mockRequest

    beforeEach(() => {
      APIRequests.RETURNS.getLicenceReturn.mockReset()
      APIRequests.RETURNS.updateLicenceReturn.mockReset()

      mockRequest = {
        cache: jest.fn().mockReturnValue({
          getData: jest.fn(),
          setData: jest.fn()
        }),
        payload: {
          'yes-no': 'yes'
        }
      }
    })

    it('should get the journey data and update the licence return', async () => {
      const mockJourneyData = {
        returns: {
          id: '123'
        },
        licenceId: '456'
      }
      mockRequest.cache().getData.mockResolvedValue(mockJourneyData)

      const mockLicenceReturn = {
        someKey: 'someValue'
      }
      APIRequests.RETURNS.getLicenceReturn.mockResolvedValue(mockLicenceReturn)

      await setData(mockRequest)

      expect(APIRequests.RETURNS.getLicenceReturn).toHaveBeenCalledWith(
        '456',
        '123'
      )
      expect(APIRequests.RETURNS.updateLicenceReturn).toHaveBeenCalledWith(
        '456',
        '123',
        {
          ...mockLicenceReturn,
          returnsUpload: true,
          uploadAnotherFile: true
        }
      )
      expect(mockRequest.cache().setData).toHaveBeenCalledWith({
        ...mockJourneyData,
        returns: {
          id: '123',
          returnsUpload: true
        }
      })
    })

    it('should handle "no" in the yes-no payload', async () => {
      mockRequest.payload['yes-no'] = 'no'

      const mockJourneyData = {
        returns: {
          id: '123'
        },
        licenceId: '456'
      }
      mockRequest.cache().getData.mockResolvedValue(mockJourneyData)

      await setData(mockRequest)

      expect(APIRequests.RETURNS.updateLicenceReturn).toHaveBeenCalledWith(
        '456',
        '123',
        expect.objectContaining({
          returnsUpload: false
        })
      )
    })

    it('should handle error in getLicenceReturn API call', async () => {
      const mockJourneyData = {
        returns: {
          id: '123'
        },
        licenceId: '456'
      }
      mockRequest.cache().getData.mockResolvedValue(mockJourneyData)
      APIRequests.RETURNS.getLicenceReturn.mockRejectedValue(
        new Error('API Error')
      )

      await expect(setData(mockRequest)).rejects.toThrow('API Error')
    })

    it('should handle error in updateLicenceReturn API call', async () => {
      const mockJourneyData = {
        returns: {
          id: '123'
        },
        licenceId: '456'
      }
      mockRequest.cache().getData.mockResolvedValue(mockJourneyData)
      APIRequests.RETURNS.getLicenceReturn.mockResolvedValue({})
      APIRequests.RETURNS.updateLicenceReturn.mockRejectedValue(
        new Error('API Update Error')
      )

      await expect(setData(mockRequest)).rejects.toThrow('API Update Error')
    })
  })
})
