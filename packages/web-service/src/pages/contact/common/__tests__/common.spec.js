import { contactApplicationsData } from './contact-applications-data.js'
import { accountApplicationsData } from './account-applications-data.js'

describe('contact common', () => {
  beforeEach(() => jest.resetModules())

  describe('getContactCandidates and hasContactCandidates', () => {
    it('calculates the candidate set where: the contacts are not assigned to any user', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            findAllContactApplicationRolesByUser: jest.fn().mockReturnValue(contactApplicationsData)
          }
        }
      }))
      const { getContactCandidates } = await import('../common.js')
      const result = await getContactCandidates(
        '00ed369a-6765-45e3-bdad-546b774319f5',
        '1c3e7655-bb74-4420-9bf0-0bd710987f10',
        'ECOLOGIST',
        ['ALTERNATIVE-ECOLOGIST'],
        false
      )
      expect(result).toEqual([
        {
          assoc: true,
          cloneOf: '1bfa51f5-1027-4b37-bf67-1fe5c6b85af8',
          contactRole: 'ECOLOGIST',
          fullName: 'Broken clone',
          groupId: 'j608d4f0-100e-495f-811f-510a28336ca5',
          id: 'j608d4f0-100e-495f-811f-510a28336ca5',
          isImmutable: true,
          updatedAt: '2022-11-28T08:15:17.507Z'
        },
        {
          cloneOf: '8bfa51f5-1027-4b37-bf67-1fe5c6b85af8',
          contactRole: 'ECOLOGIST',
          fullName: 'ed14f4d5e5e734349975-F-G-H-I-J',
          groupId: '473e959c-2f23-4304-8ff3-0690d03e5b71',
          id: 'f608d4f0-100e-495f-811f-510a28336ca5',
          isImmutable: true,
          updatedAt: '2022-11-28T08:15:17.507Z',
          assoc: true
        },
        {
          assoc: true,
          cloneOf: null,
          contactRole: 'ECOLOGIST',
          fullName: null,
          groupId: 'g608d4f0-100e-495f-811f-510a28336ca5',
          id: 'g608d4f0-100e-495f-811f-510a28336ca5',
          isImmutable: false,
          updatedAt: '2022-11-28T08:15:17.507Z'
        }
      ])
    })
    it('calculates the candidate set where: the contacts assigned to the user', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            findAllContactApplicationRolesByUser: jest.fn().mockReturnValue(contactApplicationsData)
          }
        }
      }))
      const { getContactCandidates } = await import('../common.js')
      const result = await getContactCandidates(
        '00ed369a-6765-45e3-bdad-546b774319f5',
        '1c3e7655-bb74-4420-9bf0-0bd710987f10',
        'ECOLOGIST',
        ['ALTERNATIVE-ECOLOGIST'],
        true
      )
      expect(result).toEqual([
        {
          cloneOf: 'ad8600bb-191d-45f4-8b44-846ca7a533a2',
          contactRole: 'ECOLOGIST',
          fullName: '70804cf7cf61529bc8e4-A-B-C-D-E',
          groupId: 'ac04b423-1197-44fd-95c9-d25c3bc5813e',
          id: '7b186e97-37c4-4cae-baa4-b1b5775a7718',
          isImmutable: true,
          updatedAt: '2022-11-28T08:15:17.251Z',
          assoc: true
        },
        {
          assoc: true,
          cloneOf: '1bfa51f5-1027-4b37-bf67-1fe5c6b85af8',
          contactRole: 'ECOLOGIST',
          fullName: 'Broken clone',
          groupId: 'j608d4f0-100e-495f-811f-510a28336ca5',
          id: 'j608d4f0-100e-495f-811f-510a28336ca5',
          isImmutable: true,
          updatedAt: '2022-11-28T08:15:17.507Z'
        },
        {
          cloneOf: '8bfa51f5-1027-4b37-bf67-1fe5c6b85af8',
          contactRole: 'ECOLOGIST',
          fullName: 'ed14f4d5e5e734349975-F-G-H-I-J',
          groupId: '473e959c-2f23-4304-8ff3-0690d03e5b71',
          id: 'f608d4f0-100e-495f-811f-510a28336ca5',
          isImmutable: true,
          updatedAt: '2022-11-28T08:15:17.507Z',
          assoc: true
        },
        {
          assoc: true,
          cloneOf: null,
          contactRole: 'ECOLOGIST',
          fullName: null,
          groupId: 'g608d4f0-100e-495f-811f-510a28336ca5',
          id: 'g608d4f0-100e-495f-811f-510a28336ca5',
          isImmutable: false,
          updatedAt: '2022-11-28T08:15:17.507Z'
        }
      ])
    })

    it('determines if the set has any members', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            findAllContactApplicationRolesByUser: jest.fn().mockReturnValue(contactApplicationsData)
          }
        }
      }))
      const { hasContactCandidates } = await import('../common.js')
      const result = await hasContactCandidates(
        '00ed369a-6765-45e3-bdad-546b774319f5',
        '1c3e7655-bb74-4420-9bf0-0bd710987f10',
        'ECOLOGIST',
        ['ALTERNATIVE-ECOLOGIST'],
        true
      )
      expect(result).toBeTruthy()
    })
  })

  describe('getAccountCandidates and hasAccountCandidates', () => {
    it('calculates the candidate set correctly', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            findAllAccountApplicationRolesByUser: jest.fn().mockReturnValue(accountApplicationsData)
          }
        }
      }))
      const { getAccountCandidates } = await import('../common.js')
      const result = await getAccountCandidates(
        '00ed369a-6765-45e3-bdad-546b774319f5',
        '1c3e7655-bb74-4420-9bf0-0bd710987f10',
        'ECOLOGIST-ORGANISATION', []
      )
      expect(result).toEqual([
        {
          cloneOf: '4c1aa342-8940-4936-a1d5-0adc25cdd72f',
          groupId: '028ee601-313c-4e3e-b13e-5e27ea25a739',
          id: 'b4c5bde4-003b-43e7-8324-79ab0841ee10',
          isImmutable: true,
          name: '43a9336630f376572de2-F-G-H-I-J',
          updatedAt: '2022-11-28T08:15:18.025Z'
        }, {
          cloneOf: null,
          groupId: 'd5c5bde4-003b-43e7-8324-79ab0841ee10',
          id: 'd5c5bde4-003b-43e7-8324-79ab0841ee10',
          isImmutable: true,
          name: '43a9336630f376572de2-F-G-H-I-J',
          updatedAt: '2022-11-28T08:15:18.025Z'
        }, {
          cloneOf: '1144158f-a6cd-45fc-ba7e-db292d59fa3c',
          groupId: '55e64f90-0b3c-4441-abf0-fbbfeaf34b0e',
          id: '667c5943-77c0-4d15-af8b-33d5128e0dee',
          isImmutable: true,
          name: 'a6a6c6f5ce64cfd6a9d2-A-B-C-D-E',
          updatedAt: '2022-11-28T08:15:17.806Z'
        }
      ])
    })

    it('determine if the set has any members', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            findAllAccountApplicationRolesByUser: jest.fn().mockReturnValue(accountApplicationsData)
          }
        }
      }))
      const { hasAccountCandidates } = await import('../common.js')
      const result = await hasAccountCandidates(
        '00ed369a-6765-45e3-bdad-546b774319f5',
        '1c3e7655-bb74-4420-9bf0-0bd710987f10',
        'ECOLOGIST-ORGANISATION', []
      )
      expect(result).toBeTruthy()
    })
  })
})
