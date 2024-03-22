import { contactURIs } from '../../../../../uris.js'

describe('the email-address page', () => {
  beforeEach(() => jest.resetModules())

  describe('getEmailAddressData', () => {
    it('if an account has been assigned return the contact name, the account name and the account email', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ name: 'The Rolling Stones', contactDetails: { email: 'Keith@therollingstones.com' } }))
            })
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
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards', contactDetails: { email: 'keith@mail.com' } }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            })
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

  describe('setEmailAddressData', () => {
    it('assigns the email address', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards', contactDetails: { email: 'keith@mail.com' } }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            })
          }
        }
      }))
      const mockSetEmailAddress = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactAccountOperations: () => ({
          setEmailAddress: mockSetEmailAddress
        })
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        }),
        payload: {
          'email-address': 'Keith@therollingstones.com',
          'change-email': 'yes'
        }
      }
      const { setEmailAddressData } = await import('../email-address.js')
      await setEmailAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetEmailAddress).toHaveBeenCalledWith('Keith@therollingstones.com')
    })

    it('assigns the email address if needed in account', async () => {
      const mockSetEmailAddress = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactAccountOperations: () => ({
          setEmailAddress: mockSetEmailAddress
        })
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards', contactDetails: { email: 'keith@mail.com' } }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ name: 'The Rolling STones' }))
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        }),
        payload: {
          'change-email': 'no'
        }
      }
      const { setEmailAddressData } = await import('../email-address.js')
      await setEmailAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetEmailAddress).toHaveBeenCalledWith('keith@mail.com')
    })

    it('ignore if the email is not changing', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards', contactDetails: { email: 'keith@mail.com' } }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            })
          }
        }
      }))
      const mockSetEmailAddress = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactAccountOperations: () => ({
          setEmailAddress: mockSetEmailAddress
        })
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
        }),
        payload: {
          'email-address': 'Keith@therollingstones.com',
          'change-email': 'no'
        }
      }
      const { setEmailAddressData } = await import('../email-address.js')
      await setEmailAddressData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetEmailAddress).not.toHaveBeenCalled()
    })
  })

  describe('emailAddressCompletion', () => {
    it('if an account is assigned redirect to the postcode page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
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
              'email-address': 'Keith@therollingstones.com'
            }
          }))
        })
      }
      const { emailAddressCompletion } = await import('../email-address.js')
      const result = await emailAddressCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT, () => { return contactURIs.APPLICANT.CHECK_ANSWERS })(request)
      expect(result).toEqual(contactURIs.APPLICANT.POSTCODE.uri)
    })

    it('if an account is assigned and has an address, and has submitted a reference purhcase order number, redirect to the check page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return {
                referenceOrPurchaseOrderNumber: '123abc'
              }
            }
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                id: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
                address: 'Address'
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
              'email-address': 'Keith@therollingstones.com'
            }
          }))
        })
      }
      const { emailAddressCompletion } = await import('../email-address.js')
      const result = await emailAddressCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT, () => { return contactURIs.APPLICANT.CHECK_ANSWERS })(request)
      expect(result).toEqual(contactURIs.APPLICANT.CHECK_ANSWERS.uri)
    })

    it('if no account is assigned redirect to the postcode page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
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
              'email-address': 'Keith@therollingstones.com'
            }
          }))
        })
      }
      const { emailAddressCompletion } = await import('../email-address.js')
      const result = await emailAddressCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual(contactURIs.APPLICANT.POSTCODE.uri)
    })

    it('if no account is assigned and the contact has an address, redirect to the check page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                id: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
                address: 'Address'
              }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
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
              'email-address': 'Keith@therollingstones.com'
            }
          }))
        })
      }
      const { emailAddressCompletion } = await import('../email-address.js')
      const result = await emailAddressCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual(contactURIs.APPLICANT.CHECK_ANSWERS.uri)
    })
  })
})
