import { ContactRoles } from '../../common/contact-roles.js'
import { contactURIs } from '../../../../uris.js'

describe('additional-contacts: common', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe('getAdditionalContactData', () => {
    it('fetches the appropriate data', async () => {
      const request = {
        cache: () => ({
          getPageData: () => null,
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
            additionalContact: { [ContactRoles.ADDITIONAL_APPLICANT]: true }
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            APPLICATION: {
              tags: () => ({
                get: jest.fn(),
                set: jest.fn()
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const { getAdditionalContactData } = await import('../common.js')
      const result = await getAdditionalContactData(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })
  })

  describe('setAdditionalContactData', () => {
    it('set the data correctly if the user responds \'yes\'', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          }),
          setData: mockSetData
        })
      }
      const { setAdditionalContactData } = await import('../common.js')
      await setAdditionalContactData(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(mockSetData).toHaveBeenCalledWith({
        additionalContact: { 'ADDITIONAL-APPLICANT': true },
        applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
        userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
      })
    })

    it('set the data correctly if the user responds \'no\'', async () => {
      const mockUnlink = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                unLink: mockUnlink,
                getByApplicationId: () => ({ id: '6c77278f-b1d8-4754-97ba-d86b5c05d51e' })
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          }),
          setData: mockSetData
        })
      }
      const { setAdditionalContactData } = await import('../common.js')
      await setAdditionalContactData(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(mockSetData).toHaveBeenCalledWith({
        additionalContact: { 'ADDITIONAL-APPLICANT': false },
        applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
        userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
      })
      expect(mockUnlink).toHaveBeenCalledWith('94de2969-91d4-48d6-a5fe-d828a244aa18', '6c77278f-b1d8-4754-97ba-d86b5c05d51e')
    })
  })

  describe('addAdditionalContactCompletion', () => {
    it('returns the ecologist-add page if the user answers no', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          }),
          getPageData: () => ({ payload: { 'yes-no': 'no' } })
        })
      }
      const { addAdditionalContactCompletion } = await import('../common.js')
      const result = await addAdditionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/add-additional-ecologist')
    })

    it('returns the name page if there are no candidate contacts', async () => {
      jest.doMock('../../common/common.js', () => ({
        getContactCandidates: () => []
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'yes' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { addAdditionalContactCompletion } = await import('../common.js')
      const result = await addAdditionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-name')
    })

    it('returns the names page if there are candidate contacts', async () => {
      jest.doMock('../../common/common.js', () => ({
        getContactCandidates: () => [{ id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b' }]
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'yes' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { addAdditionalContactCompletion } = await import('../common.js')
      const result = await addAdditionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-names')
    })
  })

  describe('additionalContactNameCompletion', () => {
    it('returns the email address page if required', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' })
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactNameCompletion } = await import('../common.js')
      const result = await additionalContactNameCompletion(ContactRoles.APPLICANT,
        contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-email')
    })

    it('returns the next page if email already set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', contactDetails: { email: 'a@a.com' } })
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactNameCompletion } = await import('../common.js')
      const result = await additionalContactNameCompletion(ContactRoles.APPLICANT,
        contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-contact-check-answers')
    })
  })

  describe('additionalContactNamesCompletion', () => {
    it('returns the email page if the contact requires an email address', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' })
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { contact: '8a3e8c32-0138-402c-8913-87e78ed44ebd' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactNamesCompletion } = await import('../common.js')
      const result = await additionalContactNamesCompletion(ContactRoles.APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-email')
    })

    it('returns the next page if the contact email address is set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', contactDetails: { email: 'a@a.com' } })
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { contact: '8a3e8c32-0138-402c-8913-87e78ed44ebd' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactNamesCompletion } = await import('../common.js')
      const result = await additionalContactNamesCompletion(ContactRoles.APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-contact-check-answers')
    })

    it('returns the name page a new contact is not selected', async () => {
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { contact: 'new' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactNamesCompletion } = await import('../common.js')
      const result = await additionalContactNamesCompletion(ContactRoles.APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-name')
    })
  })

  describe('getAdditionalContactEmailAddressData', () => {
    it('returns the contact email data', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({
                  id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
                  fullName: 'Bob Dylan',
                  contactDetails: { email: 'bob@strummer.com' }
                })
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { contact: '8a3e8c32-0138-402c-8913-87e78ed44ebd' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { getAdditionalContactEmailAddressData } = await import('../common.js')
      const result = await getAdditionalContactEmailAddressData(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual({
        contactName: 'Bob Dylan',
        email: 'bob@strummer.com'
      })
    })
  })

  describe('setAdditionalContactEmailAddressData', () => {
    it('sets the email address data as expected', async () => {
      const mockSetEmailAddress = jest.fn()
      const request = {
        payload: { 'email-address': 'bob@strummer.com', 'change-email': 'yes' },
        cache: () => ({
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      jest.doMock('../../common/operations.js', () => ({
        contactAccountOperations: () => ({
          setEmailAddress: mockSetEmailAddress
        })
      }))
      const { setAdditionalContactEmailAddressData } = await import('../common.js')
      await setAdditionalContactEmailAddressData(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(mockSetEmailAddress).toHaveBeenCalledWith('bob@strummer.com')
    })
  })

  describe('additionalContactEmailCompletion', () => {
    it('returns the check page if complete', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            APPLICATION: {
              tags: () => ({
                get: jest.fn().mockReturnValueOnce('complete')
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const request = {
        payload: { 'email-address': 'bob@strummer.com' },
        cache: () => ({
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
            additionalContact: { [ContactRoles.ADDITIONAL_APPLICANT]: true, [ContactRoles.ADDITIONAL_ECOLOGIST]: true }
          })
        })
      }
      const { additionalContactEmailCompletion } = await import('../common.js')
      const result = await additionalContactEmailCompletion(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-contact-check-answers')
    })

    it('returns the next page if in progress', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            APPLICATION: {
              tags: () => ({
                get: jest.fn().mockReturnValueOnce('in-progress')
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })
      const request = {
        payload: { 'email-address': 'bob@strummer.com' },
        cache: () => ({
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactEmailCompletion } = await import('../common.js')
      const result = await additionalContactEmailCompletion(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/add-additional-ecologist')
    })
  })
})
