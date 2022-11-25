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
      const { checkHasContact } = await import('../common.js')
      await checkHasContact('APPLICANT')(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })
  })

  describe('checkHasNames', () => {
    it('returns no redirect if there are some selectable ', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            // findAllByUser: jest.fn(() => [
            //   { id: 'e8387a83-1165-42e6-afab-add01e77bc4c', fullName: 'Brian' },
            //   { id: 'f8387a83-1165-42e6-afab-add01e77bc4c', fullName: 'Syd' }
            // ]),
            findAllContactApplicationRolesByUser: jest.fn()
              .mockReturnValue([{
                id: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
                contactRole: 'ANOTHER_ROLE',
                applicationId: '45a6c59e-0faf-438b-b4d5-6967d8d075cb'
              }]),
            isImmutable: () => true
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
      const { checkHasNames } = await import('../common.js')
      await checkHasNames('APPLICANT', ['ANOTHER_ROLE'], contactURIs.APPLICANT)(request, h)
      expect(h.redirect).not.toHaveBeenCalled()
    })

    it('returns redirect to the NAME page if there are none selectable ', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            // findAllByUser: jest.fn(() => [
            //   { id: 'e8387a83-1165-42e6-afab-add01e77bc4c', fullName: 'Brian' },
            //   { id: 'f8387a83-1165-42e6-afab-add01e77bc4c', fullName: 'Syd' }
            // ]),
            findAllContactApplicationRolesByUser: jest.fn()
              .mockReturnValue([{
                id: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
                applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
                contactRole: 'ANOTHER_ROLE'
              }]),
            isImmutable: () => true
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
      const { checkHasNames } = await import('../common.js')
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
      const { checkHasAddress } = await import('../common.js')
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
      const { checkHasAddress } = await import('../common.js')
      await checkHasAddress(contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applicant-postcode')
    })
  })

  describe.skip('contactsFilter', () => {
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
          cloneOf: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
      expect(result).toEqual([
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null,
          groupId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          groupId: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
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
          cloneOf: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ], true)
      expect(result).toEqual([
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null,
          userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
          groupId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          groupId: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
    })

    it('produces the list including the last immutable clone where there is no mutable', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            isImmutable: jest.fn()
              .mockReturnValueOnce(false)
              .mockReturnValueOnce(true)
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
          cloneOf: null,
          updatedAt: '2020-10-05T14:48:00.000Z'
        }, {
          id: '6a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2a - immutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          updatedAt: '2021-10-05T14:48:00.000Z'
        },
        {
          id: '7a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2b - immutable',
          cloneOf: '6a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          updatedAt: '2022-10-05T14:48:00.000Z'
        }
      ])
      expect(result).toEqual([
        {
          id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 1 - mutable',
          cloneOf: null,
          groupId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }, {
          id: '7a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          fullName: 'Name 2b - immutable',
          cloneOf: '6a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          groupId: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          updatedAt: '2022-10-05T14:48:00.000Z'
        }
      ])
    })
  })

  describe.skip('accountsFilter', () => {
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
          cloneOf: null,
          groupId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }, {
          id: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          name: 'Name 2a - mutable',
          cloneOf: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
          groupId: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
        }
      ])
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
      const { checkCanBeUser } = await import('../common.js')
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
      const { checkCanBeUser } = await import('../common.js')
      await checkCanBeUser(['APPLICANT'], contactURIs.APPLICANT)(request, h)
      expect(h.redirect).not.toHaveBeenCalled()
    })
  })

  describe('contactsRoute', () => {
    it('Returns the NAME page if there are no selectable contacts', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            findAllByUser: jest.fn(() => [
              { id: 'e8387a83-1165-42e6-afab-add01e77bc4c', fullName: 'Brian' },
              { id: 'f8387a83-1165-42e6-afab-add01e77bc4c', fullName: 'Syd' }
            ]),
            getApplicationContacts: jest.fn()
              .mockReturnValue([{
                id: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
                contactRole: 'ANOTHER_ROLE',
                applicationId: '45a6c59e-0faf-438b-b4d5-6967d8d075cb'
              }]),
            isImmutable: () => true
          }
        }
      }))
      const { contactsRoute } = await import('../common.js')
      const result = await contactsRoute('54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        '45a6c59e-0faf-438b-b4d5-6967d8d075cb',
        'ANOTHER_ROLE', [], contactURIs.APPLICANT)
      expect(result).toEqual('/applicant-name')
    })

    it('Returns the NAMES page if there are selectable contacts', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            findAllByUser: jest.fn(() => [
              { id: 'e8387a83-1165-42e6-afab-add01e77bc4c', fullName: 'Brian' },
              { id: 'f8387a83-1165-42e6-afab-add01e77bc4c', fullName: 'Syd' }
            ]),
            getApplicationContacts: jest.fn()
              .mockReturnValue([{
                id: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
                contactRole: 'ANOTHER_ROLE',
                applicationId: '45a6c59e-0faf-438b-b4d5-6967d8d075cb'
              }]),
            isImmutable: () => true
          }
        }
      }))
      const { contactsRoute } = await import('../common.js')
      const result = await contactsRoute('54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        '65a6c59e-0faf-438b-b4d5-6967d8d075cb',
        'ANOTHER_ROLE', [], contactURIs.APPLICANT)
      expect(result).toEqual('/applicant-names')
    })
  })

  describe('accountsRoute', () => {
    it('Returns the NAMES page if there are selectable accounts', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              findByUser: () => [{ id: '1c3e7655-bb74-4420-9bf0-0bd710987f10' }]
            }),
            isImmutable: () => true
          }
        }
      }))
      const { accountsRoute } = await import('../common.js')
      const result = await accountsRoute('ANOTHER_ROLE', '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        '45a6c59e-0faf-438b-b4d5-6967d8d075cb',
        contactURIs.APPLICANT)
      expect(result).toEqual('/applicant-organisations')
    })
  })
  it('Returns the NAME page if there are no selectable accounts', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ACCOUNT: {
          role: () => ({
            findByUser: () => []
          }),
          isImmutable: () => true
        }
      }
    }))
    const { accountsRoute } = await import('../common.js')
    const result = await accountsRoute('ANOTHER_ROLE', '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
      '45a6c59e-0faf-438b-b4d5-6967d8d075cb',
      contactURIs.APPLICANT)
    expect(result).toEqual('/applicant-organisation')
  })
})
