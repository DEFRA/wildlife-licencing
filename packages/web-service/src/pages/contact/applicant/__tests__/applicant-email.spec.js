
import { contactURIs } from '../../../../uris.js'
describe('applicant email page', () => {
  beforeEach(() => jest.resetModules())

  describe('applicant email completion', () => {
    it('redirects to phone number url when we have an account and phone number not yet set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'email-address': 'john@smith.com'
            }
          }))
        })
      }
      const { completion } = await import('../applicant-email.js')
      const result = await completion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/licence-holder-phone-number')
    })

    it('redirects to check your answers url when we have an account and the phone number is set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                id: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
                contactDetails: {
                  phoneNumber: '0123456789'
                }
              }))
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'email-address': 'john@smith.com'
            }
          }))
        })
      }
      const { completion } = await import('../applicant-email.js')
      const result = await completion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/licence-holder-check-answers')
    })

    it('redirects to phone number url when we dont have an account and the phone number is not set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => (null))
            })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                id: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
              }))
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'email-address': 'john@smith.com'
            }
          }))
        })
      }
      const { completion } = await import('../applicant-email.js')
      const result = await completion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/licence-holder-phone-number')
    })

    it('redirects to check your answers url when we dont have an account and the phone number set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => (null))
            })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                id: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
                contactDetails: {
                  phoneNumber: '0123456789'
                }
              }))
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'email-address': 'john@smith.com'
            }
          }))
        })
      }
      const { completion } = await import('../applicant-email.js')
      const result = await completion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/licence-holder-check-answers')
    })
  })
})
