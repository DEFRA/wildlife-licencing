
import pkg from 'sequelize'
const { Sequelize } = pkg
const Op = Sequelize.Op

jest.spyOn(console, 'error').mockImplementation(() => null)

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const respFunc = jest.fn(() => ({
  type: typeFunc
}))
const h = { response: respFunc }

const request = { payload: { username: 'email.co.uk' } }

describe('The reset handler', () => {
  beforeEach(() => jest.resetModules())

  it('Returns a 400 user not found response', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findAll: jest.fn(() => [])
        }
      }
    }))
    const resetHandler = (await import('../reset.js')).default
    await resetHandler(null, request, h)
    expect(codeFunc).toBeCalledWith(400)
  })

  it('throws with error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findAll: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const resetHandler = (await import('../reset.js')).default
    await expect(() => resetHandler(null, request, h)).rejects.toThrowError()
  })

  it('deletes all data for a user', async () => {
    const mockDestroyApplicationUsers = jest.fn()
    const mockDestroyApplicationContacts = jest.fn()
    const mockDestroyApplicationAccounts = jest.fn()
    const mockDestroyApplicationSites = jest.fn()
    const mockDestroyContacts = jest.fn()
    const mockDestroyAccounts = jest.fn()
    const mockDestroySites = jest.fn()
    const mockDestroyHabitatSites = jest.fn()
    const mockDestroyPreviousLicences = jest.fn()
    const mockDestroyApplicationUploads = jest.fn()
    const mockDestroyApplications = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: { cache: { keys: () => [], delete: () => null } }
    }))

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: { findAll: jest.fn(() => [{ id: '98296f05-5b7c-4fd9-bfed-859d882be805' }]) },
        applicationUsers: { findAll: jest.fn(() => [{ applicationId: '4649e882-5840-4515-8c72-16d252b446bb' }]), destroy: mockDestroyApplicationUsers },
        applicationContacts: { findAll: jest.fn(() => [{ contactId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' }]), destroy: mockDestroyApplicationContacts },
        applicationAccounts: { findAll: jest.fn(() => [{ accountId: '0d8cb076-efff-4406-9209-4caeb56d613f' }]), destroy: mockDestroyApplicationAccounts },
        applicationSites: { findAll: jest.fn(() => [{ siteId: '1c3e7655-bb74-4420-9bf0-0bd710987f10' }]), destroy: mockDestroyApplicationSites },
        contacts: { destroy: mockDestroyContacts },
        accounts: { destroy: mockDestroyAccounts },
        sites: { destroy: mockDestroySites },
        habitatSites: { destroy: mockDestroyHabitatSites },
        previousLicences: { destroy: mockDestroyPreviousLicences },
        applicationUploads: { destroy: mockDestroyApplicationUploads },
        applications: { destroy: mockDestroyApplications }
      }
    }))
    const resetHandler = (await import('../reset.js')).default
    await resetHandler(null, request, h)
    expect(codeFunc).toBeCalledWith(200)
    expect(mockDestroyApplicationUsers).toBeCalledWith({ where: { applicationId: { [Op.in]: ['4649e882-5840-4515-8c72-16d252b446bb'] } } })
    expect(mockDestroyApplicationContacts).toBeCalledWith({ where: { applicationId: { [Op.in]: ['4649e882-5840-4515-8c72-16d252b446bb'] } } })
    expect(mockDestroyApplicationAccounts).toBeCalledWith({ where: { applicationId: { [Op.in]: ['4649e882-5840-4515-8c72-16d252b446bb'] } } })
    expect(mockDestroyApplicationSites).toBeCalledWith({ where: { applicationId: { [Op.in]: ['4649e882-5840-4515-8c72-16d252b446bb'] } } })
    expect(mockDestroyContacts).toBeCalledWith({ where: { id: { [Op.in]: ['54b5c443-e5e0-4d81-9daa-671a21bd88ca'] } } })
    expect(mockDestroyAccounts).toBeCalledWith({ where: { id: { [Op.in]: ['0d8cb076-efff-4406-9209-4caeb56d613f'] } } })
    expect(mockDestroySites).toBeCalledWith({ where: { id: { [Op.in]: ['1c3e7655-bb74-4420-9bf0-0bd710987f10'] } } })
    expect(mockDestroyHabitatSites).toBeCalledWith({ where: { applicationId: { [Op.in]: ['4649e882-5840-4515-8c72-16d252b446bb'] } } })
    expect(mockDestroyPreviousLicences).toBeCalledWith({ where: { applicationId: { [Op.in]: ['4649e882-5840-4515-8c72-16d252b446bb'] } } })
    expect(mockDestroyApplicationUploads).toBeCalledWith({ where: { applicationId: { [Op.in]: ['4649e882-5840-4515-8c72-16d252b446bb'] } } })
    expect(mockDestroyApplications).toBeCalledWith({ where: { id: { [Op.in]: ['4649e882-5840-4515-8c72-16d252b446bb'] } } })
  })
})
