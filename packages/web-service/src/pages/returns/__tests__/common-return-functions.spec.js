import { APPLICATIONS, ReturnsURIs } from '../../../uris.js'
import { redirectIfNextUriNotCheckYourAnswers } from '../common-return-functions.js'

jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the common return functions', () => {
  beforeEach(() => jest.resetModules())
  const mockSetData = jest.fn()

  describe('the licenceActionsCompletion function', () => {
    it('redirects to the another licence actions page', async () => {
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'ABC-567-GHU',
            returns: {
              id: '123456789',
              methodTypes: ['12345678', '987654321'],
              methodTypesLength: 2,
              methodTypesNavigated: 1
            }
          }),
          setData: mockSetData
        })
      }
      const { licenceActionsCompletion } = await import('../common-return-functions.js')
      await licenceActionsCompletion(request)
      expect(mockSetData).toHaveBeenCalled()
    })

    it('redirects to the artificial sett page', async () => {
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'ABC-567-GHU',
            returns: {
              id: '123456789',
              methodTypes: ['12345678', '987654321'],
              methodTypesLength: 2,
              methodTypesNavigated: 0
            }
          }),
          setData: mockSetData
        })
      }
      const { licenceActionsCompletion } = await import('../common-return-functions.js')
      expect(await licenceActionsCompletion(request)).toEqual('/a24/artificial-sett')
    })
  })

  describe('checkLicence', () => {
    it('the check licence should return null when there is a licence number and application id on the cache', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            licenceId: '123-AbEF-67'
          })
        })
      }

      const { checkLicence } = await import('../common-return-functions.js')
      expect(await checkLicence(request)).toBeNull()
    })

    it('the check data should redirect if there is no licence id or application id', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }

      const { checkLicence } = await import('../common-return-functions.js')
      await checkLicence(request, h)
      expect(mockRedirect).toHaveBeenCalled()
      expect(mockRedirect).toHaveBeenCalledWith('/applications')
    })

    it('getNilReturnReason', async () => {
      const { getNilReturnReason } = await import('../common-return-functions.js')
      expect(await getNilReturnReason(452120002)).toBe('other')
      expect(await getNilReturnReason(452120001)).toBe('The sett was not in active use by badgers')
      expect(await getNilReturnReason(452120000)).toBe('The development work did not happen')
    })
  })

  describe('getNilReturnReason', () => {
    it('should extract the nil return reason', async () => {
      const { getNilReturnReason } = await import('../common-return-functions.js')
      expect(await getNilReturnReason(452120002)).toBe('other')
      expect(await getNilReturnReason(452120001)).toBe('The sett was not in active use by badgers')
      expect(await getNilReturnReason(452120000)).toBe('The development work did not happen')
    })
  })

  describe('getWhyNoArtificialSettReason', () => {
    it('should extract the nil return reason', async () => {
      const returnDataOne = { noArtificialSettReason: 452120000 }
      const returnDataTwo = { noArtificialSettReason: 452120001, noArtificialSettReasonDetails: 'other reason in place' }
      const { getWhyNoArtificialSettReason } = await import('../common-return-functions.js')
      expect(await getWhyNoArtificialSettReason(returnDataOne)).toBe('It was not required by the licence')
      expect(await getWhyNoArtificialSettReason(returnDataTwo)).toBe('other reason in place')
    })
  })

  describe('allCompletion', () => {
    it('should call getNextUri with data from calling getLicenceReturn and getLicenceMethodTypes', async () => {
      const getDataMock = jest.fn(() => ({
        returns: {
          id: '1'
        },
        licenceId: '2'
      }))

      const request = {
        cache: () => {
          return {
            getData: getDataMock
          }
        }
      }

      const getNextUriMock = jest.fn()

      const getLicenceReturnMock = jest.fn(() => ({
        nilReturn: true
      }))

      const methodIdsStub = ['12345678', '987654321']

      const getLicenceActionsMock = jest.fn(() => ([{
        methodIds: methodIdsStub
      }]))

      jest.doMock('../get-next-uri.js', () => ({
        getNextUri: getNextUriMock
      }))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturn: getLicenceReturnMock,
            getLicenceActions: getLicenceActionsMock
          }
        }
      }))

      const { allCompletion } = await import('../common-return-functions.js')

      await allCompletion(request)

      expect(getLicenceActionsMock).toHaveBeenCalled()
      expect(getDataMock).toHaveBeenCalled()
      expect(getNextUriMock).toHaveBeenCalledWith({
        nilReturn: true
      }, methodIdsStub)
    })

    it('should return the application page uri if returns id not set in cache', async () => {
      const getDataMock = jest.fn(() => ({
        returns: {
          id: '1'
        }
      }))

      const request = {
        cache: () => {
          return {
            getData: getDataMock
          }
        }
      }

      const { allCompletion } = await import('../common-return-functions.js')

      const uri = await allCompletion(request)

      expect(uri).toEqual(APPLICATIONS.uri)
    })

    it('should return the application page uri if licence id not set in cache', async () => {
      const getDataMock = jest.fn(() => ({
        licenceId: '2'
      }))

      const request = {
        cache: () => {
          return {
            getData: getDataMock
          }
        }
      }

      const { allCompletion } = await import('../common-return-functions.js')

      const uri = await allCompletion(request)

      expect(uri).toEqual(APPLICATIONS.uri)
    })
  })

  describe('resetReturnDataPayload', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.clearAllMocks()
    })

    it('should return expected payload when called', async () => {
      const mockLicenceReturn = {
        returnReferenceNumber: 'mockReturnRef',
        id: 'mockId'
      }
      const mockLicenceId = 'mockLicenceId'
      const mockNilReturn = false
      const expectedMethodTypes = [
        'one', 'two', 'three'
      ]

      jest.mock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceActions: jest.fn().mockResolvedValue(expectedMethodTypes)
          }
        }
      }))

      const { resetReturnDataPayload } = await import('../common-return-functions.js')

      const result = await resetReturnDataPayload(mockLicenceReturn, mockLicenceId, mockNilReturn)

      expect(result).toEqual({
        nilReturn: mockNilReturn,
        activityTypes: expect.any(Object), // since we don't have the exact mock for activityTypes, use any Array
        methodTypes: expect.any(Array),
        returnReferenceNumber: mockLicenceReturn.returnReferenceNumber,
        id: mockLicenceReturn.id
      })
    })
  })

  describe('redirectIfNextUriNotCheckYourAnswers', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.clearAllMocks()
    })

    it('redirects when the nextUri is not the check your answers page', async () => {
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }

      const nextUri = 'not-check-answers'

      redirectIfNextUriNotCheckYourAnswers(nextUri, h)

      expect(mockRedirect).toHaveBeenCalledWith(nextUri)
    })

    it('does not redirect when the nextUri is the check your answers page', async () => {
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }

      const nextUri = ReturnsURIs.CHECK_YOUR_ANSWERS.uri

      redirectIfNextUriNotCheckYourAnswers(nextUri, h)

      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })
})
