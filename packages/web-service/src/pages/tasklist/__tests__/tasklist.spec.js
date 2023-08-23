import { DEFAULT_ROLE } from '../../../constants.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { SECTION_TASKS, SECTIONS, TASKS } from '../general-sections.js'

describe('The task-list handler', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('returns null if applicationId parameter is an application owned by the user', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findRoles: () => [DEFAULT_ROLE],
            getById: () => ({ userSubmission: null })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({ userId: '510db545-4136-48c4-9680-98d89d3962e7' })
        }),
        query: { applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' }
      }
      const { checkData } = await import('../tasklist.js')
      const result = await checkData(request)
      expect(result).toBeNull()
    })

    it('causes redirect to the applications page if the application has been submitted', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findRoles: () => [DEFAULT_ROLE],
            getById: () => ({ userSubmission: '2023-04-26T13:19:32Z' })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({ userId: '510db545-4136-48c4-9680-98d89d3962e7' })
        }),
        query: { applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' }
      }
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../tasklist.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })

    it('causes redirect to the applications page if applicationId parameter is an application not owned by the user', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findRoles: () => []
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({ userId: '510db545-4136-48c4-9680-98d89d3962e7' })
        }),
        query: { applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' }
      }
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../tasklist.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })

    it('causes redirect to the applications page if applicationId is not found in cache', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ userId: '510db545-4136-48c4-9680-98d89d3962e7' })
        })
      }
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../tasklist.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })

    it('causes redirect to the applications page if applicationId is not found in database', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => null
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({ userId: '510db545-4136-48c4-9680-98d89d3962e7', applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' })
        })
      }
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../tasklist.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })

    it('returns null if the  applicationId is found in database', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => ({ userId: '510db545-4136-48c4-9680-98d89d3962e7', applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({ id: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' })
        })
      }
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../tasklist.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })
  })

  describe('the getApplication function', () => {
    it('gets an application if provided as a query parameter', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => ({ applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' }),
            findApplicationUsers: () => [{ applicationRole: 'ECOLOGIST' }]
          }
        }
      }))
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({ userId: '510db545-4136-48c4-9680-98d89d3962e7' }),
          setData: mockSetData
        }),
        query: { applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' }
      }
      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(result).toEqual({ applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' })
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064',
        userId: '510db545-4136-48c4-9680-98d89d3962e7',
        applicationRole: 'ECOLOGIST'
      })
    })

    it('gets an application if provided as a cache item', async () => {
      const mockInitialize = jest.fn().mockReturnValue({
        application: {
          id: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064'
        }
      })
      jest.doMock('../../contact/common/operations.js', () => ({
        contactOperations: () => ({ assign: jest.fn(), create: jest.fn() }),
        accountOperations: () => ({ assign: jest.fn(), create: jest.fn() })
      }))
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            initialize: mockInitialize
          },
          CONTACT: {
            findContactsByIDMUser: jest.fn().mockReturnValue([])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            userId: '510db545-4136-48c4-9680-98d89d3962e7',
            applicationId: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064',
            applicationRole: 'APPLICANT'
          })
        })
      }
      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(result).toEqual({ id: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' })
      expect(mockInitialize).toHaveBeenCalledWith('510db545-4136-48c4-9680-98d89d3962e7', '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064', DEFAULT_ROLE, 'APPLICANT')
    })
  })

  it('the getData function returns the correct data to the template', async () => {
    jest.doMock('../../contact/common/operations.js', () => ({
      contactOperations: () => ({ assign: jest.fn(), create: jest.fn() }),
      accountOperations: () => ({ assign: jest.fn(), create: jest.fn() })
    }))
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        CONTACT: {
          findContactsByIDMUser: jest.fn().mockReturnValue([])
        },
        APPLICATION: {
          tags: () => ({
            getAll: () => [{ tag: 'eligibility-check', tagState: 'in-progress' }]
          }),
          initialize: jest.fn(() => ({
            application: {
              id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de',
              applicationReferenceNumber: 'ref',
              applicationTypeId: PowerPlatformKeys.APPLICATION_TYPES.A24
            }
          }))
        }
      }
    }))

    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          userId: '510db545-4136-48c4-9680-98d89d3962e7',
          applicationId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de',
          applicationRole: 'APPLICANT'
        }))
      })
    }

    const mockCanShowReferenceFunc = jest.fn().mockReturnValue(true)
    jest.doMock('../licence-type.js', () => {
      const { LicenceType } = jest.requireActual('../licence-type.js')
      const Test = new LicenceType({
        name: 'A24 Badger',
        canShowReferenceFunc: mockCanShowReferenceFunc,
        getProgressFunc: async () => ({ complete: 3, from: 4 }),
        sectionTasks: [
          {
            section: SECTIONS.CHECK_BEFORE_YOU_START,
            tasks: [
              TASKS[SECTION_TASKS.ELIGIBILITY_CHECK]
            ]
          }
        ]
      })
      return {
        LICENCE_TYPE_TASKLISTS: {
          [PowerPlatformKeys.APPLICATION_TYPES.A24]: Test
        }
      }
    })

    const { getData } = await import('../tasklist.js')
    const result = await getData(request)
    expect(result).toEqual({
      licenceType: 'A24 Badger',
      licenceTypeMap: [
        {
          name: 'check-before-you-start',
          tasks: [
            {
              enabled: true,
              name: 'eligibility-check',
              status: 'in-progress',
              uri: '/landowner'
            }
          ]
        }
      ],
      progress: { complete: 3, from: 4 },
      reference: 'ref'
    })
  })

  describe('setUpIDMContacts', () => {
    it('creates a new IDM contact if none exist for the user', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            findContactsByIDMUser: jest.fn().mockReturnValue([])
          }
        }
      }))
      const mockCreate = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../contact/common/operations.js', () => ({
        contactOperations: () => ({ assign: mockAssign, create: mockCreate })
      }))
      const { setUpIDMContacts } = await import('../tasklist.js')
      await setUpIDMContacts('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', 'ECOLOGIST')
      expect(mockCreate).toHaveBeenCalledWith(true)
    })

    it('creates a new IDM contact if none exist for the user that exactly match', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            findContactsByIDMUser: jest.fn().mockReturnValue([{ fullName: 'A' }])
          },
          USER: {
            getById: jest.fn().mockReturnValue({ fullName: 'B' })
          }
        }
      }))
      const mockCreate = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../contact/common/operations.js', () => ({
        contactOperations: () => ({ assign: mockAssign, create: mockCreate })
      }))
      const { setUpIDMContacts } = await import('../tasklist.js')
      await setUpIDMContacts('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', 'ECOLOGIST')
      expect(mockCreate).toHaveBeenCalledWith(true)
    })

    it('reuses an IDM contact if one exists for the user that exactly match', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            findContactsByIDMUser: jest.fn().mockReturnValue([{ id: 1, fullName: 'A' }])
          },
          USER: {
            getById: jest.fn().mockReturnValue({ fullName: 'A' })
          }
        }
      }))
      const mockCreate = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../contact/common/operations.js', () => ({
        contactOperations: () => ({ assign: mockAssign, create: mockCreate })
      }))
      const { setUpIDMContacts } = await import('../tasklist.js')
      await setUpIDMContacts('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', 'ECOLOGIST')
      expect(mockAssign).toHaveBeenCalledWith(1)
    })
  })

  describe('setUpIDMAccounts', () => {
    it('creates a new IDM account if none exist for the organisation', async () => {
      const mockCreate = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            findAccountsByIDMOrganisation: jest.fn().mockReturnValue([])
          }
        }
      }))
      jest.doMock('../../contact/common/operations.js', () => ({
        accountOperations: () => ({ assign: mockAssign, create: mockCreate })
      }))
      const { setUpIDMAccounts } = await import('../tasklist.js')
      await setUpIDMAccounts('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', 'ECOLOGIST_ORGANISATION')
      expect(mockCreate).toHaveBeenCalledWith(true)
    })

    it('creates a new IDM account if none exactly match for the organisation', async () => {
      const mockCreate = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            findAccountsByIDMOrganisation: jest.fn().mockReturnValue([{ name: 'A' }])
          },
          USER: {
            getOrganisation: jest.fn().mockReturnValue({ name: 'B' })
          }
        }
      }))
      jest.doMock('../../contact/common/operations.js', () => ({
        accountOperations: () => ({ assign: mockAssign, create: mockCreate })
      }))
      const { setUpIDMAccounts } = await import('../tasklist.js')
      await setUpIDMAccounts('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', 'ECOLOGIST_ORGANISATION')
      expect(mockCreate).toHaveBeenCalledWith(true)
    })

    it('reuses an existing IDM account if one exactly matches for the organisation', async () => {
      const mockCreate = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            findAccountsByIDMOrganisation: jest.fn().mockReturnValue([{ id: 1, name: 'A' }])
          },
          USER: {
            getOrganisation: jest.fn().mockReturnValue({ name: 'A' })
          }
        }
      }))
      jest.doMock('../../contact/common/operations.js', () => ({
        accountOperations: () => ({ assign: mockAssign, create: mockCreate })
      }))
      const { setUpIDMAccounts } = await import('../tasklist.js')
      await setUpIDMAccounts('35acb529-70bb-4b8d-8688-ccdec837e5d4', 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', 'ECOLOGIST_ORGANISATION')
      expect(mockAssign).toHaveBeenCalledWith(1)
    })
  })

  describe('the tasklist backLink function', () => {
    it('returns no backlink if not authenticated', async () => {
      const request = {
        auth: { isAuthenticated: false }
      }
      const { tasklistBacklink } = await import('../tasklist.js')
      const result = await tasklistBacklink(request)
      expect(result).toBeFalsy()
    })

    it('returns no backlink if authenticated without applications', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findByUser: jest.fn(() => [])
          }
        }
      }))
      const request = {
        auth: { isAuthenticated: true },
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
          }))
        })
      }
      const { tasklistBacklink } = await import('../tasklist.js')
      const result = await tasklistBacklink(request)
      expect(result).toBeFalsy()
    })

    it('returns the javascript backlink if authenticated with applications', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findByUser: jest.fn(() => [{}, {}])
          }
        }
      }))
      const request = {
        auth: { isAuthenticated: true },
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
          }))
        })
      }
      const { tasklistBacklink } = await import('../tasklist.js')
      const result = await tasklistBacklink(request)
      expect(result).toEqual('javascript: window.history.go(-1)')
    })
  })
})
