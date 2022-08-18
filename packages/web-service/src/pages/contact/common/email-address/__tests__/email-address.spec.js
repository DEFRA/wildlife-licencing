import { ApiRequestEntities } from '../../../../../services/api-requests.js'

describe('the email-address functions', () => {
  beforeEach(() => jest.resetModules())

  describe('checkData', () => {
    it('if no application is selected return to the applications page', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({}))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkEmailAddressData } = await import('../email-address.js')
      await checkEmailAddressData(ApiRequestEntities.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })
    it('if no contact is selected return to the tasklist page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => null)
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkEmailAddressData } = await import('../email-address.js')
      await checkEmailAddressData(ApiRequestEntities.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })
    it('if contact is selected return null', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ id: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }))
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkEmailAddressData } = await import('../email-address.js')
      const result = await checkEmailAddressData(ApiRequestEntities.APPLICANT)(request, h)
      expect(h.redirect).not.toHaveBeenCalledWith()
      expect(result).toBeNull()
    })
  })

  describe('getData', () => {
    it('if an account has been assigned return the contact name, the account name and the account email', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' }))
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({ name: 'The Rolling Stones', email: 'Keith@therollingstones.com' }))
          }
        }
      }))
      const { getEmailAddressData } = await import('../email-address.js')
      const result = await getEmailAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(result).toEqual({
        accountName: 'The Rolling Stones',
        contactName: 'Keith Richards',
        email: 'Keith@therollingstones.com'
      })
    })
    it('if no account has been assigned return the contact name and the contact email', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards', email: 'keith@mail.com' }))
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => null)
          }
        }
      }))
      const { getEmailAddressData } = await import('../email-address.js')
      const result = await getEmailAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(result).toEqual({
        contactName: 'Keith Richards',
        email: 'keith@mail.com'
      })
    })
  })

  describe('setData', () => {
    it('if an account is assigned set the email address on the account', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })),
          getPageData: jest.fn(() => ({ payload: { 'email-address': 'Keith@therollingstones.com' } }))
        })
      }
      const mockUpdate = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' }))
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({ name: 'The Rolling Stones' })),
            update: mockUpdate
          }
        }
      }))
      const { setEmailAddressData } = await import('../email-address.js')
      await setEmailAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockUpdate).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7',
        {
          contactDetails: { email: 'Keith@therollingstones.com' },
          name: 'The Rolling Stones'
        })
    })
    it('if no account is assigned set the email address on the contact', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })),
          getPageData: jest.fn(() => ({ payload: { 'email-address': 'Keith@mail.com' } }))
        })
      }
      const mockUpdate = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' })),
            update: mockUpdate
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => null)
          }
        }
      }))
      const { setEmailAddressData } = await import('../email-address.js')
      await setEmailAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockUpdate).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7',
        {
          contactDetails: { email: 'Keith@mail.com' },
          fullName: 'Keith Richards'
        })
    })
  })

  describe('completion', () => {
    it('TODO', async () => {
    })
  })
})
