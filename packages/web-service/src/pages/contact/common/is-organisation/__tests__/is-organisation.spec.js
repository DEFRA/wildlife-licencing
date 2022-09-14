import { contactURIs } from '../../../../../uris.js'

describe('the is-organisation page', () => {
  beforeEach(() => jest.resetModules())

  describe('getContactAccountData', () => {
    it('returns the contact and account data for the role', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({ fullName: 'The Who' }))
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      const { getContactAccountData } = await import('../is-organisation.js')
      const result = await getContactAccountData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(result).toEqual({
        account: {
          fullName: 'The Who'
        },
        contact: {
          fullName: 'Keith Moon'
        }
      })
    })
  })

  describe('setContactAccountData', () => {
    it('assigns an account if the user returns \'yes\'', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../common.js', () => ({
        accountOperations: () => ({
          create: mockCreate
        })
      }))

      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              remove: jest.fn()
            })
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'yes',
              'organisation-name': 'The Who'
            }
          })),
          setPageData: jest.fn()
        }),
        payload: {
          'is-organisation': 'yes',
          'organisation-name': 'The Who'
        }
      }
      const { setContactAccountData } = await import('../is-organisation.js')
      await setContactAccountData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockCreate).toHaveBeenCalledWith('The Who')
    })

    it('un-assigns an account if the user returns \'no\'', async () => {
      const mockSetOrganisation = jest.fn()
      jest.doMock('../../common.js', () => ({
        contactAccountOperations: () => ({
          setOrganisation: mockSetOrganisation
        })
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        }),
        payload: {
          'is-organisation': 'no'
        }
      }
      const { setContactAccountData } = await import('../is-organisation.js')
      await setContactAccountData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetOrganisation).toHaveBeenCalledWith(false)
    })
  })

  describe('contactAccountCompletion', () => {
    it('if the user has selected \'yes\' and the account is immutable go to the check-answers page ', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
            })
          },
          ACCOUNT: {
            isImmutable: () => true
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'yes',
              'organisation-name': 'The Who'
            }
          }))
        })
      }

      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-check-answers')
    })

    it('if the user has selected \'yes\', the account is not immutable and no contact details are set go to the email page ', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
            })
          },
          ACCOUNT: {
            isImmutable: () => false
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'yes',
              'organisation-name': 'The Who'
            }
          })),
          clearPageData: jest.fn()
        })
      }

      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-email')
    })

    it('if the user has selected \'yes\', the account is not immutable and no address is set go to the postcode page ', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
              contactDetails: { email: 'JohnEntwistle@thewho.com' }
            })
          },
          ACCOUNT: {
            isImmutable: () => false
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'yes',
              'organisation-name': 'The Who'
            }
          })),
          clearPageData: jest.fn()
        })
      }

      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-postcode')
    })

    it('if the user has selected \'yes\', the account is not immutable and an address is set go to the check-answers page ', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
              contactDetails: { email: 'JohnEntwistle@thewho.com' },
              address: 'Address'
            })
          },
          ACCOUNT: {
            isImmutable: () => false
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'yes',
              'organisation-name': 'The Who'
            }
          })),
          clearPageData: jest.fn()
        })
      }

      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-check-answers')
    })

    it('if the user has selected \'no\', and the contact is immutable go to the check-answers page ', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
            })
          },
          CONTACT: {
            isImmutable: () => true
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'no'
            }
          })),
          clearPageData: jest.fn()
        })
      }

      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-check-answers')
    })

    it('if the user has selected \'no\', the contact is not immutable and there are no contactDetails set go to the email page ', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4'
            })
          },
          CONTACT: {
            isImmutable: () => false
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'no'
            }
          })),
          clearPageData: jest.fn()
        })
      }

      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-email')
    })

    it('if the user has selected \'no\', the contact is not immutable and there is no address set go to the postcode page ', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
              contactDetails: { email: 'john.coltrane@jazz.ltd' }
            })
          },
          CONTACT: {
            isImmutable: () => false
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'no'
            }
          })),
          clearPageData: jest.fn()
        })
      }

      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-postcode')
    })

    it('if the user has selected \'no\', the contact is not immutable and an address is set go to the check page ', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
              contactDetails: { email: 'john.coltrane@jazz.ltd' },
              address: 'Address'
            })
          },
          CONTACT: {
            isImmutable: () => false
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'no'
            }
          })),
          clearPageData: jest.fn()
        })
      }

      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-check-answers')
    })
  })
})
