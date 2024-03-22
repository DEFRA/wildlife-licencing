import { contactURIs } from '../../../../../uris.js'

describe('the phone-number page', () => {
  beforeEach(() => jest.resetModules())

  describe('getPhoneNumberData', () => {
    it('if an account has been assigned return the contact name, the account name and the account phoneNumber', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'John Smith' }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ name: 'Acme Corp', contactDetails: { phoneNumber: '0123456789' } }))
            })
          }
        }
      }))
      const { getPhoneNumberData } = await import('../phone-number.js')
      const result = await getPhoneNumberData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(result).toEqual({
        accountName: 'Acme Corp',
        contactName: 'John Smith',
        phoneNumber: '0123456789'
      })
    })
    it('if no account has been assigned return the contact name and the contact phoneNumber', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'John Smith', contactDetails: { phoneNumber: '0123456789' } }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            })
          }
        }
      }))
      const { getPhoneNumberData } = await import('../phone-number.js')
      const result = await getPhoneNumberData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(result).toEqual({
        contactName: 'John Smith',
        phoneNumber: '0123456789'
      })
    })
  })

  describe('setPhoneNumberData', () => {
    it('assigns the phone number', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'John Smith', contactDetails: { phoneNumber: '0123456789' } }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            })
          }
        }
      }))
      const mockSetPhoneNumber = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactAccountOperations: () => ({
          setPhoneNumber: mockSetPhoneNumber
        })
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        }),
        payload: {
          'phone-number': '0123456789'
        }
      }
      const { setPhoneNumberData } = await import('../phone-number.js')
      await setPhoneNumberData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetPhoneNumber).toHaveBeenCalledWith('0123456789')
    })
  })

  describe('phoneNumberCompletion', () => {
    it('Redirects to the check answers page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
            })
          }
        }
      }))
      const { phoneNumberCompletion } = await import('../phone-number.js')
      const result = await phoneNumberCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)
      expect(result).toEqual(contactURIs.APPLICANT.CHECK_ANSWERS)
    })
  })
})
