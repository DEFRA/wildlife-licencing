import { APPLICATIONS, contactURIs } from '../../../../uris.js'

describe('contact common', () => {
  beforeEach(() => jest.resetModules())
  describe('checkHasApplication', () => {
    it('returns redirect to the application page if applicationId is not set', async () => {
      const { checkHasApplication } = await import('../common.js')
      const request = {
        cache: () => ({ getData: jest.fn(() => ({})) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      const result = await checkHasApplication(request, h)
      expect(result).toEqual('redirect')
      expect(mockRedirect).toHaveBeenCalledWith(APPLICATIONS.uri)
    })

    it('returns null if applicationId is set', async () => {
      const { checkHasApplication } = await import('../common.js')
      const request = {
        cache: () => ({ getData: jest.fn(() => ({ applicationId: '64154be7-35d3-480b-ae97-38331605bf28' })) })
      }
      const h = {}
      const result = await checkHasApplication(request, h)
      expect(result).toBeNull()
    })
  })

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
      const { checkHasContact } = await import('../common.js')
      const result = await checkHasContact('APPLICANT', contactURIs.APPLICANT)(request, h)
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
      const { checkHasContact } = await import('../common.js')
      await checkHasContact('APPLICANT', contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applicant-user')
    })

    it('returns to the applications page if no applicationId is set', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkHasContact } = await import('../common.js')
      await checkHasContact('APPLICANT', contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
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
      const { checkHasAddress } = await import('../common.js')
      const result = await checkHasAddress('APPLICANT', contactURIs.APPLICANT)(request, h)
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
      const { checkHasAddress } = await import('../common.js')
      await checkHasAddress('APPLICANT', contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applicant-postcode')
    })
  })

  describe('contactsFilter', () => {
    it('produces the list including a mutable clone where user associations are disallowed', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            isImmutable: jest.fn()
              .mockReturnValueOnce(false)
              .mockReturnValueOnce(true)
              .mockReturnValueOnce(false)
              .mockReturnValueOnce(true)
          }
        }
      }))
      const { contactsFilter } = await import('../common.js')
      const result = await contactsFilter('54b5c443-e5e0-4d81-9daa-671a21bd88ca', [
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null
        }, {
          id: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2 - immutable',
          cloneOf: null
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }, {
          id: '6a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 3b - immutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
      expect(result).toEqual([
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
    })

    it('produces the list including a mutable clone where user associations are allowed', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            isImmutable: jest.fn()
              .mockReturnValueOnce(false)
              .mockReturnValueOnce(true)
              .mockReturnValueOnce(false)
              .mockReturnValueOnce(true)
          }
        }
      }))
      const { contactsFilter } = await import('../common.js')
      const result = await contactsFilter('54b5c443-e5e0-4d81-9daa-671a21bd88ca', [
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null,
          userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
        }, {
          id: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2 - immutable',
          cloneOf: null
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }, {
          id: '6a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 3b - immutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ], true)
      expect(result).toEqual([
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null,
          userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
    })

    it('produces the list including a mutable clone where there is no mutable', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            isImmutable: jest.fn()
              .mockReturnValueOnce(false)
              .mockReturnValueOnce(true)
              .mockReturnValueOnce(true)
          }
        }
      }))
      const { contactsFilter } = await import('../common.js')
      const result = await contactsFilter('54b5c443-e5e0-4d81-9daa-671a21bd88ca', [
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null
        }, {
          id: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2 - immutable',
          cloneOf: null
        }, {
          id: '6a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 3b - immutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
      expect(result).toEqual([
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null
        }, {
          id: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2 - immutable',
          cloneOf: null
        }
      ])
    })
  })

  describe('accountsFilter', () => {
    it('similar to contacts filter', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            isImmutable: jest.fn()
              .mockReturnValueOnce(false)
              .mockReturnValueOnce(true)
              .mockReturnValueOnce(false)
              .mockReturnValueOnce(true)
          }
        }
      }))
      const { accountsFilter } = await import('../common.js')
      const result = await accountsFilter('54b5c443-e5e0-4d81-9daa-671a21bd88ca', [
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          name: 'Name 1 - mutable',
          cloneOf: null
        }, {
          id: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          name: 'Name 2 - immutable',
          cloneOf: null
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          name: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }, {
          id: '6a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          name: 'Name 3b - immutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
      expect(result).toEqual([
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          name: 'Name 1 - mutable',
          cloneOf: null
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          name: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
    })
  })
})
