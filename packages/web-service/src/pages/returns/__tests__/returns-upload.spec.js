import { setData } from '../returns-upload'
import { APIRequests } from '../../../services/api-requests.js'

jest.mock('../../../services/api-requests.js')

describe('Returns upload functions', () => {
  describe('setData', () => {
    let mockRequest

    beforeEach(() => {
      // Reset the APIRequests mock methods before each test
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
      // Mocked journey data
      const mockJourneyData = {
        returns: {
          id: '123'
        },
        licenceId: '456'
      }
      mockRequest.cache().getData.mockResolvedValue(mockJourneyData)

      // Mocked licence return data
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
          returnsUpload: true
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

    // ... [previous code]

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

      // Expect an error to be thrown
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

      // Expect an error to be thrown
      await expect(setData(mockRequest)).rejects.toThrow('API Update Error')
    })
  })
})
