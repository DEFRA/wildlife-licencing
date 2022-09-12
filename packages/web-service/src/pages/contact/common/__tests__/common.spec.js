import { APPLICATIONS } from '../../../../uris.js'
import { contactAccountOperations } from '../common.js'

describe('contact common', () => {
  beforeEach(() => jest.resetModules())
  describe('checkData', () => {
    it('returns redirect to the application page if applicationId is not set', async () => {
      const { checkData } = await import('../common.js')
      const request = {
        cache: () => ({ getData: jest.fn(() => ({})) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      const result = await checkData(request, h)
      expect(result).toEqual('redirect')
      expect(mockRedirect).toHaveBeenCalledWith(APPLICATIONS.uri)
    })

    it('returns null if applicationId is set', async () => {
      const { checkData } = await import('../common.js')
      const request = {
        cache: () => ({ getData: jest.fn(() => ({ applicationId: '64154be7-35d3-480b-ae97-38331605bf28' })) })
      }
      const h = {}
      const result = await checkData(request, h)
      expect(result).toBeNull()
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

  describe('contactOperations', () => {
    it('the create function generates the correct contact', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => null),
            create: mockCreate
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT', '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.create(false, 'Brian Ferry')
      expect(mockCreate).toHaveBeenCalledWith('54b5c443-e5e0-4d81-9daa-671a21bd88ca', { fullName: 'Brian Ferry' })
    })

    it('the create function does nothing where a contact is already assigned', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })),
            create: mockCreate
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT', '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.create(false, 'Brian Ferry')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('the create function generates the correct contact as the signed in user', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => null),
            create: mockCreate
          },
          USER: {
            getById: jest.fn(() => ({
              id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
              username: 'brian.ferry@roxymusic.com'
            }))
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT', '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.create(true, 'Brian Ferry')
      expect(mockCreate).toHaveBeenCalledWith('54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        { contactDetails: { email: 'brian.ferry@roxymusic.com' }, fullName: 'Brian Ferry', userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
    })

    it('the assign function reassigned a contact where a contact is already assigned', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn()
              .mockReturnValueOnce({ id: '64b5c443-e5e0-4d81-9daa-671a21bd88ca' })
              .mockReturnValue({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
            unLink: mockUnlink,
            assign: mockAssign
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      expect(mockAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('the assign function does nothing if the contact is not changing', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn()
              .mockReturnValueOnce({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
            unLink: mockUnlink,
            assign: mockAssign
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).not.toHaveBeenCalled()
      expect(mockAssign).not.toHaveBeenCalled()
    })

    it('the assign function does not unlink if no contact is yet assigned', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn()
              .mockReturnValueOnce(null)
              .mockReturnValueOnce({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
            unLink: mockUnlink,
            assign: mockAssign
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).not.toHaveBeenCalled()
      expect(mockAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('the unAssign function calls unlink if a contact is assigned', async () => {
      const mockUnlink = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn()
              .mockReturnValue({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
            unLink: mockUnlink
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.unAssign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
    })

    it('the unAssign function does nothing if no contact is assigned', async () => {
      const mockUnlink = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue(null),
            unLink: mockUnlink
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.unAssign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).not.toHaveBeenCalled()
    })

    it('the setName function does nothing with an immutable contact', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue(
              {
                id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                contactDetails: { email: 'email@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              }),
            update: mockUpdate
          },
          CONTACT: {
            isImmutable: () => true
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.setName('Jon Bonham')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('the setName function does nothing if no contact is assigned', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue(null),
            update: mockUpdate
          },
          CONTACT: {
            isImmutable: () => true
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.setName('Jon Bonham')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('the setName function sets the name if a contact is assigned and retains any other details', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue(
              {
                id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                contactDetails: { email: 'email@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              }),
            update: mockUpdate
          },
          CONTACT: {
            isImmutable: () => false
          }
        }
      }))
      const { contactOperations } = await import('../common.js')
      const contactOps = await contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.setName('Jon Bonham')
      expect(mockUpdate).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', {
        address: 'Address',
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        contactDetails: { email: 'email@email.com' },
        fullName: 'Jon Bonham',
        userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
      })
    })
  })

  describe('accountOperations', () => {
    it('creates the account with the name supplied', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null),
            create: mockCreate
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.create('Organisation name')
      expect(mockCreate).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', { name: 'Organisation name' })
    })

    it('creates the account with no name', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null),
            create: mockCreate
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.create()
      expect(mockCreate).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', {})
    })

    it('does not create an account if one is assigned', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue({ id: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
            create: mockCreate
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.create()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('assign re-assigns the account if one is already assigned', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn()
              .mockReturnValueOnce({ id: '64b5c443-e5e0-4d81-9daa-671a21bd88ca' })
              .mockReturnValue({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
            unLink: mockUnlink,
            assign: mockAssign
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      expect(mockAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('assign assigns a new the account', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn()
              .mockReturnValueOnce(null),
            unLink: mockUnlink,
            assign: mockAssign
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).not.toHaveBeenCalled()
      expect(mockAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('un-assign un-assigns an account', async () => {
      const mockUnlink = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn()
              .mockReturnValueOnce({ id: '64b5c443-e5e0-4d81-9daa-671a21bd88ca' }),
            unLink: mockUnlink
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.unAssign()
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
    })

    it('the setName function sets the name if an account is assigned and retains any other details', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(
              {
                id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                contactDetails: { email: 'email@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              }),
            update: mockUpdate
          },
          ACCOUNT: {
            isImmutable: () => false
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.setName('Led Zeppelin')
      expect(mockUpdate).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', {
        address: 'Address',
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        contactDetails: { email: 'email@email.com' },
        name: 'Led Zeppelin'
      })
    })

    it('the setName function does nothing if the account is immutable', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(
              {
                id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                contactDetails: { email: 'email@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              }),
            update: mockUpdate
          },
          ACCOUNT: {
            isImmutable: () => true
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.setName('Led Zeppelin')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('the setName function does nothing if no account is assigned', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null),
            update: mockUpdate
          }
        }
      }))
      const { accountOperations } = await import('../common.js')
      const acctOps = await accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.setName('Led Zeppelin')
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('contactAccountOperations - setEmailAddress', () => {
    it('sets the email address on a mutable contact, retaining other fields', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              address: 'Address',
              cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              fullName: 'Richard Wright'
            }),
            update: mockUpdate
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null)
          },
          CONTACT: {
            isImmutable: () => false
          },
          ACCOUNT: {
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@email.com')
      expect(mockUpdate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'Rick.wright@email.com' },
          fullName: 'Richard Wright',
          userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })

    it('sets the email address on a clone of an immutable contact, retaining other fields - user associated', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              address: 'Address',
              userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              fullName: 'Richard Wright'
            }),
            create: mockCreate,
            unAssign: jest.fn()
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null)
          },
          CONTACT: {
            isImmutable: () => true
          },
          ACCOUNT: {
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@email.com')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'Rick.wright@email.com' },
          fullName: 'Richard Wright',
          userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })

    it('sets the email address on a clone of an immutable contact, retaining other fields - no user associated', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              address: 'Address',
              fullName: 'Richard Wright'
            }),
            create: mockCreate,
            unAssign: jest.fn()
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null)
          },
          CONTACT: {
            isImmutable: () => true
          },
          ACCOUNT: {
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@email.com')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'Rick.wright@email.com' },
          fullName: 'Richard Wright'
        }
      )
    })

    it('sets the email address on a mutable account, retaining other fields', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              fullName: 'Richard Wright',
              userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
            })
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              address: 'Address',
              name: 'Pink Floyd'
            }),
            update: mockUpdate,
            unAssign: jest.fn()
          },
          CONTACT: {
            isImmutable: () => false
          },
          ACCOUNT: {
            isImmutable: () => false
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@pinkfloyd.com')
      expect(mockUpdate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        address: 'Address',
        contactDetails: { email: 'Rick.wright@pinkfloyd.com' },
        name: 'Pink Floyd'
      })
    })

    it('sets the email address on a clone of an immutable account, retaining other fields', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              fullName: 'Richard Wright'
            })
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              address: 'Address',
              userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              name: 'Pink Floyd'
            }),
            create: mockCreate,
            unAssign: jest.fn()
          },
          CONTACT: {
            isImmutable: () => false
          },
          ACCOUNT: {
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@pinkfloyd.com')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          contactDetails: { email: 'Rick.wright@pinkfloyd.com' },
          name: 'Pink Floyd',
          cloneOf: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })
  })

  describe('contactAccountOperations - setAddress', () => {
    it('sets the address on a mutable contact, retaining other fields', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              contactDetails: { email: 'David.Gilmore@floyd.com' },
              cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              fullName: 'Richard Wright'
            }),
            update: mockUpdate
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null)
          },
          CONTACT: {
            isImmutable: () => false
          },
          ACCOUNT: {
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setAddress('Address')
      expect(mockUpdate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'David.Gilmore@floyd.com' },
          fullName: 'Richard Wright',
          userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })

    it('sets the address on a clone of an immutable contact, retaining other fields - user associated', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              address: 'Address',
              userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              fullName: 'Richard Wright'
            }),
            create: mockCreate,
            unAssign: jest.fn()
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null)
          },
          CONTACT: {
            isImmutable: () => true
          },
          ACCOUNT: {
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@email.com')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'Rick.wright@email.com' },
          fullName: 'Richard Wright',
          userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })

    it('sets the address on a clone of an immutable contact, retaining other fields - no user associated', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              contactDetails: { email: 'David.Gilmore@floyd.com' },
              fullName: 'David Gilmore'
            }),
            create: mockCreate,
            unAssign: jest.fn()
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue(null)
          },
          CONTACT: {
            isImmutable: () => true
          },
          ACCOUNT: {
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setAddress('Address')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'David.Gilmore@floyd.com' },
          fullName: 'David Gilmore'
        }
      )
    })

    it('sets the address on a clone of a mutable account, retaining other fields', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
            })
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              contactDetails: { email: 'David.Gilmore@floyd.com' },
              name: 'Pink Floyd'
            }),
            update: mockUpdate,
            unAssign: jest.fn()
          },
          CONTACT: {
            isImmutable: () => false
          },
          ACCOUNT: {
            isImmutable: () => false
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setAddress('Address')
      expect(mockUpdate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          contactDetails: { email: 'David.Gilmore@floyd.com' },
          name: 'Pink Floyd'
        }
      )
    })

    it('sets the address on a clone of an immutable account, retaining other fields', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          APPLICANT: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
            })
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn().mockReturnValue({
              id: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              contactDetails: { email: 'David.Gilmore@floyd.com' },
              name: 'Pink Floyd'
            }),
            create: mockCreate,
            unAssign: jest.fn()
          },
          CONTACT: {
            isImmutable: () => false
          },
          ACCOUNT: {
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../common.js')
      const ops = await contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setAddress('Address')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          contactDetails: { email: 'David.Gilmore@floyd.com' },
          name: 'Pink Floyd',
          cloneOf: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })
  })
})
