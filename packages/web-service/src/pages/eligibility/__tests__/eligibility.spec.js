import { eligibilityURIs, LOGIN, TASKLIST } from '../../../uris.js'
const {
  LANDOWNER, LANDOWNER_PERMISSION, CONSENT, CONSENT_GRANTED,
  NOT_ELIGIBLE_LANDOWNER, NOT_ELIGIBLE_PROJECT, ELIGIBILITY_CHECK, ELIGIBLE
} = eligibilityURIs

describe('the eligibility pages', () => {
  beforeEach(() => jest.resetModules())
  it('the checkData function redirects to the tasklist if the applicationId is not set', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ }))
      })
    }
    const mockRedirect = jest.fn()
    const h = {
      redirect: mockRedirect
    }
    const { checkData } = await import('../eligibility.js')
    await checkData(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/tasklist')
  })

  it('the getData function returns the eligibility data from the API', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
        }))
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        ELIGIBILITY: {
          getById: jest.fn(() => ({ question: 'answer' }))
        }
      }
    }))
    const { getData } = await import('../eligibility.js')
    const result = await getData('question')(request)
    expect(result).toEqual('answer')
  })

  describe('the setData function', () => {
    it('saves the eligibility data - not landowner but has permission', async () => {
      const mockClearPageData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
          })),
          clearPageData: mockClearPageData
        })
      }
      const mockPutById = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: false })),
            putById: mockPutById
          }
        }
      }))
      const { setData } = await import('../eligibility.js')
      await setData('hasLandOwnerPermission')(request)
      expect(mockPutById).toHaveBeenCalledWith('412d7297-643d-485b-8745-cc25a0e6ec0a', { checkCompleted: false, hasLandOwnerPermission: true, isOwnerOfLand: false })
      expect(mockClearPageData).toHaveBeenCalledWith('consent-granted')
    })

    it('saves the eligibility data - is landowner and has landowner permission (disallowed)', async () => {
      const mockClearPageData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
          })),
          clearPageData: mockClearPageData
        })
      }
      const mockPutById = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: true })),
            putById: mockPutById
          }
        }
      }))
      const { setData } = await import('../eligibility.js')
      await setData('hasLandOwnerPermission')(request)
      expect(mockPutById).toHaveBeenCalledWith('412d7297-643d-485b-8745-cc25a0e6ec0a', { checkCompleted: false, isOwnerOfLand: true })
      expect(mockClearPageData).toHaveBeenCalledWith('consent-granted')
    })

    it('saves the eligibility data - permissions required and granted', async () => {
      const mockClearPageData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
          })),
          clearPageData: mockClearPageData
        })
      }
      const mockPutById = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ permissionsRequired: true })),
            putById: mockPutById
          }
        }
      }))
      const { setData } = await import('../eligibility.js')
      await setData('permissionsGranted')(request)
      expect(mockPutById).toHaveBeenCalledWith('412d7297-643d-485b-8745-cc25a0e6ec0a', {
        checkCompleted: false,
        permissionsRequired: true,
        permissionsGranted: true
      })
    })

    it('saves the eligibility data - permissions not required but granted (disallowed)', async () => {
      const mockClearPageData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
          })),
          clearPageData: mockClearPageData
        })
      }
      const mockPutById = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ permissionsRequired: false })),
            putById: mockPutById
          }
        }
      }))
      const { setData } = await import('../eligibility.js')
      await setData('permissionsGranted')(request)
      expect(mockPutById).toHaveBeenCalledWith('412d7297-643d-485b-8745-cc25a0e6ec0a', {
        checkCompleted: false,
        permissionsRequired: false
      })
      expect(mockClearPageData).toHaveBeenCalledWith('consent-granted')
    })
  })

  describe('the eligibilityCompletion function', () => {
    it('Returns the landowner page if no eligibility data set', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(LANDOWNER.uri)
    })

    it('Returns the landowner permissions page not the landowner', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: false }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(LANDOWNER_PERMISSION.uri)
    })

    it('Returns the project permissions (consent) page not the landowner', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: true }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(CONSENT.uri)
    })

    it('Returns the not-eligible page if no permissions from the landowner', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: false, hasLandOwnerPermission: false }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(NOT_ELIGIBLE_LANDOWNER.uri)
    })

    it('Returns the project permissions page not the landowner but have landowner permission', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: false, hasLandOwnerPermission: true }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(CONSENT.uri)
    })

    it('Returns the eligibility-check page if no permissions required', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: true, permissionsRequired: false }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(ELIGIBILITY_CHECK.uri)
    })

    it('Returns the permissions granted page if permissions are required', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: true, permissionsRequired: true }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(CONSENT_GRANTED.uri)
    })

    it('Returns the not-eligible-project page if permissions are required and not granted', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: true, permissionsRequired: true, permissionsGranted: false }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(NOT_ELIGIBLE_PROJECT.uri)
    })

    it('Returns the eligibility-check page if permissions are required and granted', async () => {
      const request = { cache: () => ({ getData: jest.fn() }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: true, permissionsRequired: true, permissionsGranted: true }))
          }
        }
      }))
      const { eligibilityCompletion } = await import('../eligibility.js')
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(ELIGIBILITY_CHECK.uri)
    })

    it('the checkYourAnswersGetData function \'yes\' sets isOwnerOfLand and removes hasLandOwnerPermission', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ applicationId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })) }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({
              permissionsGranted: true,
              isOwnerOfLand: false,
              hasLandOwnerPermission: true,
              permissionsRequired: true
            }))
          }
        }
      }))

      const { checkYourAnswersGetData } = await import('../eligibility.js')
      const result = await checkYourAnswersGetData(request)
      expect(result).toEqual([
        { key: 'isOwnerOfLand', value: 'no' },
        { key: 'hasLandOwnerPermission', value: 'yes' },
        { key: 'permissionsRequired', value: 'yes' },
        { key: 'permissionsGranted', value: 'yes' }
      ])
    })
  })

  it('the checkYourAnswersSetData function sets the check completed flag', async () => {
    const request = { cache: () => ({ getData: jest.fn(() => ({ applicationId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })) }) }
    const mockPutById = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        ELIGIBILITY: {
          getById: jest.fn(() => ({
            permissionsGranted: true,
            isOwnerOfLand: false,
            hasLandOwnerPermission: true,
            permissionsRequired: true
          })),
          putById: mockPutById
        }
      }
    }))

    const { checkYourAnswersSetData } = await import('../eligibility.js')
    await checkYourAnswersSetData(request)
    expect(mockPutById).toHaveBeenCalledWith('6829ad54-bab7-4a78-8ca9-dcf722117a45',
      {
        checkCompleted: true,
        hasLandOwnerPermission: true,
        isOwnerOfLand: false,
        permissionsGranted: true,
        permissionsRequired: true
      })
  })

  it('the checkYourAnswersCompletion function always returns the eligible page', async () => {
    const { checkAnswersCompletion } = await import('../eligibility.js')
    const result = checkAnswersCompletion()
    expect(result).toEqual(ELIGIBLE.uri)
  })

  describe('the eligibleCheckData function', () => {
    it('returns the a redirect to the landowner page if isOwnerOfLand is not set', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ applicationId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })) }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({}))
          }
        }
      }))

      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }
      const { eligibleCheckData } = await import('../eligibility.js')
      await eligibleCheckData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith(LANDOWNER.uri)
    })

    it('returns the a redirect to the consent page if permissionsRequired is not set', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ applicationId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })) }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: true }))
          }
        }
      }))

      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }
      const { eligibleCheckData } = await import('../eligibility.js')
      await eligibleCheckData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith(CONSENT.uri)
    })

    it('returns null if isOwnerOfLand and permissionsRequired are set', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ applicationId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })) }) }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ELIGIBILITY: {
            getById: jest.fn(() => ({ isOwnerOfLand: true, permissionsRequired: false }))
          }
        }
      }))

      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }
      const { eligibleCheckData } = await import('../eligibility.js')
      const result = await eligibleCheckData(request, h)
      expect(result).toBeNull()
    })
  })

  describe('the eligibleCompletion function', () => {
    it('returns the tasklist if authenticated', async () => {
      const { eligibleCompletion } = await import('../eligibility.js')
      const result = await eligibleCompletion({
        auth: { isAuthenticated: true }
      })
      expect(result).toEqual(TASKLIST.uri)
    })
    it('returns the login page if not authenticated', async () => {
      const { eligibleCompletion } = await import('../eligibility.js')
      const result = await eligibleCompletion({
        auth: { isAuthenticated: false }
      })
      expect(result).toEqual(LOGIN.uri)
    })
  })
})
