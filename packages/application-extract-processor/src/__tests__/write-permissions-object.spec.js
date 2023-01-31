jest.spyOn(console, 'error').mockImplementation(() => null)

const data = { permissions: { refNumber: '2349-8949-52672' } }

const keys = [
  {
    apiTable: 'permissions',
    apiKey: null,
    apiBasePath: 'permissions',
    powerAppsTable: 'sdds_planningconsents',
    contentId: null,
    powerAppsKey: 'c8a2bb18-3b1f-ed11-b83d-002248c5c45b'
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'permissions.applicationId',
    powerAppsTable: 'sdds_applications',
    contentId: null,
    powerAppsKey: 'a52db13b-f3de-40b9-9b23-ea7adbd21460'
  }
]

describe('The permissions extract processor: write-permissions-object', () => {
  beforeEach(() => jest.resetModules())

  it('does nothing if no application key found', async () => {
    const { writePermissionsObject } = await import('../write-permissions-object.js')
    const result = await writePermissionsObject({ data: {}, keys: [keys[0]] }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does nothing if the application is not found in the database', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.applications = {
      findOne: jest.fn(() => null)
    }
    const { writePermissionsObject } = await import('../write-permissions-object.js')
    const result = await writePermissionsObject({
      data: {},
      keys: keys
    }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('creates a new permission', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.permissions = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }
    const { writePermissionsObject } = await import('../write-permissions-object.js')
    const result = await writePermissionsObject({ data, keys }, null)
    expect(mockCreate).toHaveBeenCalledWith({
      applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      permission: {
        refNumber: '2349-8949-52672'
      },
      id: expect.any(String),
      sddsPermissionsId: 'c8a2bb18-3b1f-ed11-b83d-002248c5c45b',
      updateStatus: 'U'
    })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
  })

  it('makes an update on a found, pending permission with a timestamp older than the extract start time', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.permissions = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2020, 0, 1),
        permission: data.permission
      })),
      update: mockUpdate
    }
    const { writePermissionsObject } = await import('../write-permissions-object.js')
    const result = await writePermissionsObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      permission: {
        refNumber: '2349-8949-52672'
      },
      updateStatus: 'U'
    }, { returning: false, where: { id: '9487013e-abf5-4f42-95fa-15ad404570a1' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('makes an update on a found, unlocked permission, if data has changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.permissions = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1),
        permission: {
          refNumber: '2349-8949-52674'
        }
      })),
      update: mockUpdate
    }
    const { writePermissionsObject } = await import('../write-permissions-object.js')
    const result = await writePermissionsObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      permission: data.permissions,
      updateStatus: 'U'
    }, { returning: false, where: { id: '9487013e-abf5-4f42-95fa-15ad404570a1' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('ignores an update on a found, unlocked permission, if data has not changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.permissions = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1),
        permission: data.permissions
      })),
      update: mockUpdate
    }
    const { writePermissionsObject } = await import('../write-permissions-object.js')
    const result = await writePermissionsObject({ data, keys }, new Date())
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does not make an update on a found, pending permission with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.permissions = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2022, 0, 2),
        permission: {
          refNumber: '2349-8949-52674'
        }
      })),
      update: mockUpdate
    }
    const { writePermissionsObject } = await import('../write-permissions-object.js')
    const result = await writePermissionsObject({ data, keys }, new Date(2022, 0, 1))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.applications = {
      findOne: jest.fn(() => { throw new Error() })
    }
    const { writePermissionsObject } = await import('../write-permissions-object.js')
    const result = await writePermissionsObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
