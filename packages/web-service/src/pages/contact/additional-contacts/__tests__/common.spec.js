import { ContactRoles } from '../../common/contact-roles.js'
import { contactURIs } from '../../../../uris.js'

describe('additional-contacts: common', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe('getAdditionalContactData', () => {
    it('fetches the appropriate data', async () => {
      jest.doMock('../../common/common-handler.js', () => ({
        canBeUser: () => true
      }))
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
        return {
          APIRequests: {
            APPLICATION: {
              tags: () => ({
                get: jest.fn(),
                set: jest.fn()
              })
            }
          }
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
      const mockCreate = jest.fn()
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
      jest.doMock('../../common/operations.js', () => ({
        contactOperations: () => ({
          create: mockCreate
        })
      }))
      const { setAdditionalContactData } = await import('../common.js')
      await setAdditionalContactData(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(mockSetData).toHaveBeenCalledWith({
        additionalContact: { 'ADDITIONAL-APPLICANT': true },
        applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
        userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
      })
      expect(mockCreate).toHaveBeenCalledWith(false)
    })

    it('set the data correctly if the user responds \'no\'', async () => {
      const mockUnAssign = jest.fn()
      jest.doMock('../../common/operations.js', () => ({
        contactOperations: () => ({
          unAssign: mockUnAssign
        })
      }))
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
      expect(mockUnAssign).toHaveBeenCalledWith()
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

  describe('additionalContactCompletion', () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
        })
      })
    }

    it('returns the check page if there is no a contact for a given role', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => null
              })
            }
          }
        }
      })
      const { additionalContactCompletion } = await import('../common.js')
      const result = await additionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-check-answers')
    })

    it('returns the name page if the name is not set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({})
              })
            }
          }
        }
      })
      const { additionalContactCompletion } = await import('../common.js')
      const result = await additionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-name')
    })

    it('returns the email page if the email address is not set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({ fullName: 'nob' })
              })
            }
          }
        }
      })
      const { additionalContactCompletion } = await import('../common.js')
      const result = await additionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-email')
    })

    it('returns the check page if all required items are set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => {
        return {
          APIRequests: {
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({ fullName: 'nob', contactDetails: { email: 'bob@strummer.com' } })
              })
            }
          }
        }
      })

      const { additionalContactCompletion } = await import('../common.js')
      const result = await additionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)(request)
      expect(result).toEqual('/additional-applicant-check-answers')
    })
  })

  describe('additionalContactGetCheckAnswersData', () => {
    it('gets the data to render the check page for a given contact', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => {
        return {
          APIRequests: {
            APPLICATION: {
              tags: () => ({
                set: mockSet
              })
            },
            CONTACT: {
              role: () => ({
                getByApplicationId: () => ({ fullName: 'nob', contactDetails: { email: 'bob@strummer.com' } })
              })
            }
          }
        }
      })
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactGetCheckAnswersData } = await import('../common.js')
      const result = await additionalContactGetCheckAnswersData(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'additional-applicant', tagState: 'complete-not-confirmed' })
      expect(result).toEqual({ contact: [{ key: 'addAdditionalContact', value: 'yes' }, { key: 'contactName', value: 'nob' }, { key: 'contactEmail', value: 'bob@strummer.com' }] })
    })
  })

  describe('additionalContactSetCheckAnswersData', () => {
    it('sets the tag data then check page is confirmed', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              set: mockSet
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { additionalContactSetCheckAnswersData } = await import('../common.js')
      await additionalContactSetCheckAnswersData(ContactRoles.ADDITIONAL_APPLICANT)(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'additional-applicant', tagState: 'complete' })
    })
  })
})
