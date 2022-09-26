const data = {
  licence: {
    licenceNumber: {
      name: 'A1234'
    }
  }
}

const keys = [
  {
    apiTable: 'previousLicences',
    apiKey: null,
    apiBasePath: 'previousLicence',
    powerAppsTable: 'sdds_licensableactions',
    contentId: null,
    powerAppsKey: '858b9fad-7106-ed11-82e4-002248c5c45b'
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'previousLicence.applicationId',
    powerAppsTable: 'sdds_applications',
    contentId: null,
    powerAppsKey: 'fc1a9675-db01-ed11-82e5-002248c5c45b'
  }
]

describe('The application extract processor: write-previous-licence-object', () => {
  beforeEach(() => jest.resetModules())

  it('does nothing if no application key found', async () => {
    const { writePreviousLicenceObject } = await import('../write-previous-licence-object.js')
    const result = await writePreviousLicenceObject({ data: {}, keys: [keys[0]] }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does nothing if the application is not found in the database', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.applications = {
      findOne: jest.fn(() => null)
    }
    const { writePreviousLicenceObject } = await import('../write-previous-licence-object.js')
    const result = await writePreviousLicenceObject({
      data: {},
      keys: keys
    }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('creates a new previous-licence', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.previousLicences = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }
    const { writePreviousLicenceObject } = await import('../write-previous-licence-object.js')
    const result = await writePreviousLicenceObject({ data, keys }, null)
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      licence: { licenceNumber: { name: 'A1234' } },
      sddsPreviousLicenceId: '858b9fad-7106-ed11-82e4-002248c5c45b',
      updateStatus: 'U'
    }
    )
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
  })

  it('makes an update on a found, pending previous-licence with a timestamp older than the extract start time', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.previousLicences = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2020, 0, 1),
        licence: data.licence
      })),
      update: mockUpdate
    }
    const { writePreviousLicenceObject } = await import('../write-previous-licence-object.js')
    const result = await writePreviousLicenceObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      licence: data.licence,
      updateStatus: 'U'
    }, { returning: false, where: { id: '9487013e-abf5-4f42-95fa-15ad404570a1' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('makes an update on a found, unlocked previous-licence, if data has changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.previousLicences = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1),
        licence: {
          licenceNumber: {
            name: 'A1234B'
          }
        }
      })),
      update: mockUpdate
    }
    const { writePreviousLicenceObject } = await import('../write-previous-licence-object.js')
    const result = await writePreviousLicenceObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      licence: data.licence,
      updateStatus: 'U'
    }, { returning: false, where: { id: '9487013e-abf5-4f42-95fa-15ad404570a1' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('ignores an update on a found, unlocked previous-licence, if data has not changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.previousLicences = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1),
        licence: data.licence
      })),
      update: mockUpdate
    }
    const { writePreviousLicenceObject } = await import('../write-previous-licence-object.js')
    const result = await writePreviousLicenceObject({ data, keys }, new Date())
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does not make an update on a found, pending previous-licence with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.previousLicences = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2022, 0, 2),
        licence: {
          licenceNumber: {
            name: 'A1234B'
          }
        }
      })),
      update: mockUpdate
    }
    const { writePreviousLicenceObject } = await import('../write-previous-licence-object.js')
    const result = await writePreviousLicenceObject({ data, keys }, new Date(2022, 0, 1))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.applications = {
      findOne: jest.fn(() => { throw new Error() })
    }
    const { writeSiteObject } = await import('../write-site-object.js')
    const result = await writeSiteObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
