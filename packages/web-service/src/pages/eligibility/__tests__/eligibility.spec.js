import { eligibilityURIs } from '../../../uris.js'
import {
  updateEligibilityCache, eligibilityCompletion, landOwnerSetData,
  landOwnerPermissionSetData, consentSetData, consentGrantedSetData,
  checkYourAnswersGetData, checkAnswersCompletion, eligibleCheckData
} from '../eligibility.js'
const {
  LANDOWNER, LANDOWNER_PERMISSION, CONSENT, CONSENT_GRANTED,
  NOT_ELIGIBLE_LANDOWNER, NOT_ELIGIBLE_PROJECT, ELIGIBILITY_CHECK, ELIGIBLE
} = eligibilityURIs

describe('the eligibility pages', () => {
  it('the updateEligibilityCache - operates on the eligibility section of the journey cache - without eligibility section', async () => {
    const mockGetData = jest.fn()
    const mockSetData = jest.fn()
    const request = {
      cache: () => ({
        getData: mockGetData,
        setData: mockSetData
      })
    }
    const operation = e => Object.assign(e, { isOwnerOfLand: true })
    await updateEligibilityCache(request, operation)
    expect(mockSetData).toHaveBeenCalledWith({
      eligibility: { isOwnerOfLand: true },
      tasks: {
        'eligibility-check': 'in-progress'
      }
    })
  })

  it('the updateEligibilityCache - operates on the eligibility section of the journey cache - with eligibility section', async () => {
    const mockGetData = jest.fn(() => ({ eligibility: { hasLandOwnerPermission: true } }))
    const mockSetData = jest.fn()
    const request = {
      cache: () => ({
        getData: mockGetData,
        setData: mockSetData
      })
    }
    const operation = e => Object.assign(e, { isOwnerOfLand: true })
    await updateEligibilityCache(request, operation)
    expect(mockSetData).toHaveBeenCalledWith({
      eligibility: { isOwnerOfLand: true, hasLandOwnerPermission: true },
      tasks: {
        'eligibility-check': 'in-progress'
      }
    })
  })

  describe('the eligibilityCompletion function', () => {
    it('Returns the landowner page if no eligibility data set', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => null) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(LANDOWNER.uri)
    })
    it('Returns the landowner permissions page not the landowner', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: false } })) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(LANDOWNER_PERMISSION.uri)
    })
    it('Returns the project permissions (consent) page not the landowner', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: true } })) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(CONSENT.uri)
    })
    it('Returns the not-eligible page if no permissions from the landowner', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: false, hasLandOwnerPermission: false } })) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(NOT_ELIGIBLE_LANDOWNER.uri)
    })
    it('Returns the project permissions page not the landowner but have landowner permission', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: false, hasLandOwnerPermission: true } })) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(CONSENT.uri)
    })
    it('Returns the eligibility-check page if no permissions required', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: true, permissionsRequired: false } })) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(ELIGIBILITY_CHECK.uri)
    })
    it('Returns the permissions granted page if permissions are required', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: true, permissionsRequired: true } })) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(CONSENT_GRANTED.uri)
    })
    it('Returns the not-eligible-project page if permissions are required and not granted', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: true, permissionsRequired: true, permissionsGranted: false } })) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(NOT_ELIGIBLE_PROJECT.uri)
    })
    it('Returns the eligibility-check page if are permissions required and granted', async () => {
      const request = { cache: () => ({ getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: true, permissionsRequired: true, permissionsGranted: true } })) }) }
      const result = await eligibilityCompletion(request)
      expect(result).toEqual(ELIGIBILITY_CHECK.uri)
    })
  })

  describe('the landOwnerSetData function', () => {
    it('if \'yes\' sets isOwnerOfLand and removes hasLandOwnerPermission', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: true, hasLandOwnerPermission: true } })),
          setData: mockSetData
        })
      }
      await landOwnerSetData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        eligibility: { isOwnerOfLand: true },
        tasks: {
          'eligibility-check': 'in-progress'
        }
      })
    })
    it('if \'no\' unsets isOwnerOfLand', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: false, hasLandOwnerPermission: true } })),
          setData: mockSetData
        })
      }
      await landOwnerSetData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        eligibility: { isOwnerOfLand: false, hasLandOwnerPermission: true },
        tasks: {
          'eligibility-check': 'in-progress'
        }
      })
    })
  })

  describe('the landOwnerPermissionSetData function', () => {
    it('if \'yes\' sets hasLandOwnerPermission', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => null),
          setData: mockSetData
        })
      }
      await landOwnerPermissionSetData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        eligibility: { hasLandOwnerPermission: true },
        tasks: {
          'eligibility-check': 'in-progress'
        }
      })
    })
    it('if \'no\' unsets hasLandOwnerPermission', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          getData: jest.fn(() => null),
          setData: mockSetData
        })
      }
      await landOwnerPermissionSetData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        eligibility: { hasLandOwnerPermission: false },
        tasks: {
          'eligibility-check': 'in-progress'
        }
      })
    })
  })

  describe('the consentSetData function', () => {
    it('if \'yes\' sets permissionsRequired', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => null),
          setData: mockSetData
        })
      }
      await consentSetData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        eligibility: { permissionsRequired: true },
        tasks: {
          'eligibility-check': 'in-progress'
        }
      })
    })
    it('if \'no\' unsets permissionsRequired and removes permissionsGranted', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          getData: jest.fn(() => ({
            eligibility: { permissionsGranted: true },
            tasks: {
              'eligibility-check': 'in-progress'
            }
          })),
          setData: mockSetData
        })
      }
      await consentSetData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        eligibility: { permissionsRequired: false },
        tasks: {
          'eligibility-check': 'in-progress'
        }
      })
    })
  })

  describe('the consentGrantedSetData function', () => {
    it('if \'yes\' sets permissionsGranted', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => null),
          setData: mockSetData
        })
      }
      await consentGrantedSetData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        eligibility: { permissionsGranted: true },
        tasks: {
          'eligibility-check': 'in-progress'
        }
      })
    })
    it('if \'no\' unsets permissionsGranted', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          getData: jest.fn(() => null),
          setData: mockSetData
        })
      }
      await consentGrantedSetData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        eligibility: { permissionsGranted: false },
        tasks: {
          'eligibility-check': 'in-progress'
        }
      })
    })
  })

  describe('the checkYourAnswersGetData function', () => {
    it('if \'yes\' sets isOwnerOfLand and removes hasLandOwnerPermission', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            eligibility: {
              permissionsGranted: true,
              isOwnerOfLand: false,
              hasLandOwnerPermission: true,
              permissionsRequired: true
            }
          }))
        })
      }
      const result = await checkYourAnswersGetData(request)
      expect(result).toEqual([
        { key: 'isOwnerOfLand', value: 'no' },
        { key: 'hasLandOwnerPermission', value: 'yes' },
        { key: 'permissionsRequired', value: 'yes' },
        { key: 'permissionsGranted', value: 'yes' }
      ])
    })
  })

  describe('the checkYourAnswersCompletion function', () => {
    it('always returns the eligible page', async () => {
      const result = checkAnswersCompletion()
      expect(result).toEqual(ELIGIBLE.uri)
    })
  })

  describe('the eligibleCheckData function', () => {
    it('returns the a redirect to the landowner page if isOwnerOfLand is not set', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ eligibility: {} }))
        })
      }
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }
      await eligibleCheckData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith(LANDOWNER.uri)
    })
    it('returns the a redirect to the consent page if permissionsRequired is not set', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: true } }))
        })
      }
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }
      await eligibleCheckData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith(CONSENT.uri)
    })
    it('returns null if isOwnerOfLand and permissionsRequired are set', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ eligibility: { isOwnerOfLand: true, permissionsRequired: false } }))
        })
      }
      const result = await eligibleCheckData(request, { })
      expect(result).toBeNull()
    })
  })
})
