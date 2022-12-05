import { contactURIs } from '../../../../uris.js'

describe('contact common handler functions', () => {
  beforeEach(() => jest.resetModules())

  describe('checkHasContact', () => {
    it('returns null if a contact name is set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({ getByApplicationId: jest.fn(() => ({ id: 'dad9d73e-d591-41df-9475-92c032bd3ceb' })) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkHasContact } = await import('../common-handler.js')
      const result = await checkHasContact('APPLICANT')(request, h)
      expect(result).toBeNull()
    })

    it('returns to the user page if no contact name is set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({ getByApplicationId: jest.fn() })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkHasContact } = await import('../common-handler.js')
      await checkHasContact('APPLICANT')(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })
  })

  describe('checkHasNames', () => {
    it('returns no redirect if there are some selectable ', async () => {
      const h = { redirect: jest.fn() }

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }

      jest.doMock('../common.js', () => {
        return {
          hasContactCandidates: jest.fn(() => true)
        }
      })

      const { checkHasNames } = await import('../common-handler.js')
      await checkHasNames('APPLICANT', ['ANOTHER_ROLE'], contactURIs.APPLICANT)(request, h)
      expect(h.redirect).not.toHaveBeenCalled()
    })

    it('returns redirect to the NAME page if there are none selectable ', async () => {
      jest.doMock('../common.js', () => {
        return {
          hasContactCandidates: jest.fn(() => false)
        }
      })

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }

      const h = { redirect: jest.fn() }
      const { checkHasNames } = await import('../common-handler.js')
      await checkHasNames('APPLICANT', ['ANOTHER_ROLE'], contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applicant-name')
    })
  })

  describe('checkHasAddress', () => {
    it('the null page if address lookup data found in cache', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({ getByApplicationId: jest.fn(() => ({ id: 'dad9d73e-d591-41df-9475-92c032bd3ceb' })) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
            addressLookup: []
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkHasAddress } = await import('../common-handler.js')
      const result = await checkHasAddress(contactURIs.APPLICANT)(request, h)
      expect(result).toBeNull()
    })

    it('the postcode page if no address lookup data found in cache', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({ getByApplicationId: jest.fn(() => ({ id: 'dad9d73e-d591-41df-9475-92c032bd3ceb' })) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkHasAddress } = await import('../common-handler.js')
      await checkHasAddress(contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applicant-postcode')
    })
  })

  describe('checkAccountComplete', () => {
    it('return null if no account is assigned', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({ getByApplicationId: jest.fn(() => null) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkAccountComplete } = await import('../common-handler.js')
      await checkAccountComplete('PAYER-ORGANISATION', contactURIs.INVOICE_PAYER)(request, h)
      expect(h.redirect).not.toHaveBeenCalled()
    })

    it('return redirect to the email page if no email address is assigned', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({ getByApplicationId: jest.fn(() => ({ id: 'dad9d73e-d591-41df-9475-92c032bd3ceb' })) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkAccountComplete } = await import('../common-handler.js')
      await checkAccountComplete('PAYER-ORGANISATION', contactURIs.INVOICE_PAYER)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/invoice-email')
    })

    it('return redirect to the postcode page if no address is assigned', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                id: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
                contactDetails: { email: 'Steve.Howe@yes.co.uk' }
              }))
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkAccountComplete } = await import('../common-handler.js')
      await checkAccountComplete('PAYER-ORGANISATION', contactURIs.INVOICE_PAYER)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/invoice-postcode')
    })
  })

  describe('checkCanBeUser', () => {
    it('return a redirect to NAMES if the role is already assigned', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: jest.fn().mockReturnValue({ getByApplicationId: () => ({ userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' }) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkCanBeUser } = await import('../common-handler.js')
      await checkCanBeUser(['APPLICANT'], contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applicant-names')
    })

    it('return null if the role is not assigned', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: jest.fn().mockReturnValue({ getByApplicationId: () => ({ }) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkCanBeUser } = await import('../common-handler.js')
      await checkCanBeUser(['APPLICANT'], contactURIs.APPLICANT)(request, h)
      expect(h.redirect).not.toHaveBeenCalled()
    })
  })

  describe('contactsRoute', () => {
    it('Returns the NAME page if there are no selectable contacts', async () => {
      jest.doMock('../common.js', () => {
        return {
          hasContactCandidates: jest.fn(() => false)
        }
      })
      const { contactsRoute } = await import('../common-handler.js')
      const result = await contactsRoute('54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        '45a6c59e-0faf-438b-b4d5-6967d8d075cb',
        'ANOTHER_ROLE', [], contactURIs.APPLICANT)
      expect(result).toEqual('/applicant-name')
    })

    it('Returns the NAMES page if there are selectable contacts', async () => {
      jest.doMock('../common.js', () => {
        return {
          hasContactCandidates: jest.fn(() => true)
        }
      })
      const { contactsRoute } = await import('../common-handler.js')
      const result = await contactsRoute('54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        '65a6c59e-0faf-438b-b4d5-6967d8d075cb',
        'ANOTHER_ROLE', [], contactURIs.APPLICANT)
      expect(result).toEqual('/applicant-names')
    })
  })

  describe('accountsRoute', () => {
    it('Returns the NAMES page if there are selectable accounts', async () => {
      jest.doMock('../common.js', () => {
        return {
          hasAccountCandidates: jest.fn(() => true)
        }
      })
      const { accountsRoute } = await import('../common-handler.js')
      const result = await accountsRoute('ANOTHER_ROLE', [], '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        '45a6c59e-0faf-438b-b4d5-6967d8d075cb',
        contactURIs.APPLICANT)
      expect(result).toEqual('/applicant-organisations')
    })

    it('Returns the NAME page if there are no selectable accounts', async () => {
      jest.doMock('../common.js', () => {
        return {
          hasAccountCandidates: jest.fn(() => false)
        }
      })
      const { accountsRoute } = await import('../common-handler.js')
      const result = await accountsRoute('ANOTHER_ROLE', [], '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        '45a6c59e-0faf-438b-b4d5-6967d8d075cb',
        contactURIs.APPLICANT)
      expect(result).toEqual('/applicant-organisation')
    })
  })
})
