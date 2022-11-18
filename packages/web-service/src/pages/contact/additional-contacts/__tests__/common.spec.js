import { ContactRoles } from '../../common/contact-roles.js'
import { contactURIs } from '../../../../uris.js'

describe('additional-contacts: common', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe('additionalContactUserCompletion', () => {
    it('if not the signed in user, return the value returned by contactsRoute', async () => {
      jest.doMock('../../common/common.js', () => ({
        contactsRoute: () => 'contacts-route'
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'no' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactUserCompletion } = await import('../common.js')
      const result = await additionalContactUserCompletion(ContactRoles.APPLICANT,
        [ContactRoles.ADDITIONAL_APPLICANT], contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('contacts-route')
    })

    it('if the signed in user, return the name page for a newly created user', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              isImmutable: () => false,
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
          getPageData: () => ({ payload: { 'yes-no': 'yes' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }

      const { additionalContactUserCompletion } = await import('../common.js')
      const result = await additionalContactUserCompletion(ContactRoles.APPLICANT,
        [ContactRoles.ADDITIONAL_APPLICANT], contactURIs.ADDITIONAL_ECOLOGIST)(request)
      expect(result).toEqual('/additional-ecologist-name')
    })

    it('if the signed in user, return next name page for a mutable user with a name', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              isImmutable: () => false,
              role: () => ({
                getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', fullName: 'Jimi Hendrix' })
              })
            }
          },
          tagStatus: originalModule.tagStatus
        }
      })

      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'yes' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }

      const { additionalContactUserCompletion } = await import('../common.js')
      const result = await additionalContactUserCompletion(ContactRoles.APPLICANT,
        [ContactRoles.ADDITIONAL_APPLICANT], contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-contact-check-answers')
    })

    it('if the signed in user, return the next page for a immutable user', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        const originalModule = jest.requireActual('../../../../services/api-requests.js')
        return {
          APIRequests: {
            CONTACT: {
              isImmutable: () => true,
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
          getPageData: () => ({ payload: { 'yes-no': 'yes' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }

      const { additionalContactUserCompletion } = await import('../common.js')
      const result = await additionalContactUserCompletion(ContactRoles.APPLICANT,
        [ContactRoles.ADDITIONAL_APPLICANT], contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-contact-check-answers')
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
          }),
          clearPageData: jest.fn()
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
          }),
          clearPageData: jest.fn()
        })
      }
      const { additionalContactNamesCompletion } = await import('../common.js')
      const result = await additionalContactNamesCompletion(ContactRoles.APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-contact-check-answers')
    })

    it('returns the name page a new contact isn selected', async () => {
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { contact: 'new' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          }),
          clearPageData: jest.fn()
        })
      }
      const { additionalContactNamesCompletion } = await import('../common.js')
      const result = await additionalContactNamesCompletion(ContactRoles.APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-name')
    })
  })

  describe('getAdditionalContactEmailAddressData', () => {
    it('returns the contact email datas', async () => {
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
        payload: { 'email-address': 'bob@strummer.com' },
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
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
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
