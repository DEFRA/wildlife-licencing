const data = {
  habitatSite: {
    name: 'Destructive',
    startDate: '2022-01-29',
    endDate: '2022-02-03'
  }
}

const keys = [
  {
    apiTable: 'habitatSites',
    apiKey: null,
    apiBasePath: 'habitatSite',
    powerAppsTable: 'sdds_licensableactions',
    contentId: null,
    powerAppsKey: '858b9fad-7106-ed11-82e4-002248c5c45b'
  },
  {
    apiTable: 'licences',
    apiKey: null,
    apiBasePath: 'habitatSite.licenceId',
    powerAppsTable: 'sdds_licences',
    contentId: null,
    powerAppsKey: '324b293c-a184-4cca-a2d7-2d1ac14e367e'
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'habitatSite.applicationId',
    powerAppsTable: 'sdds_applications',
    contentId: null,
    powerAppsKey: 'fc1a9675-db01-ed11-82e5-002248c5c45b'
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'habitatSite.applicationId',
    powerAppsTable: 'sdds_applications',
    contentId: null,
    powerAppsKey: null // habitatSite.licenceId.applicationId
  },
  {
    apiTable: 'activities',
    apiKey: null,
    apiBasePath: 'habitatSite.activityId',
    powerAppsTable: 'sdds_licenseactivities',
    contentId: null,
    powerAppsKey: '68855554-59ed-ec11-bb3c-000d3a0cee24'
  },
  {
    apiTable: 'species',
    apiKey: null,
    apiBasePath: 'habitatSite.speciesId',
    powerAppsTable: 'sdds_species',
    contentId: null,
    powerAppsKey: 'fedb14b6-53a8-ec11-9840-0022481aca85'
  },
  {
    apiTable: 'speciesSubject',
    apiKey: null,
    apiBasePath: 'habitatSite.speciesSubjectId',
    powerAppsTable: 'sdds_speciesubjects',
    contentId: null,
    powerAppsKey: '60ce79d8-87fb-ec11-82e5-002248c5c45b'
  },
  {
    apiTable: 'methods',
    apiKey: null,
    apiBasePath: 'habitatSite.methods',
    powerAppsTable: 'sdds_licensemethods',
    contentId: null,
    powerAppsKey: '70ce79d8-87fb-ec11-82e5-002248c5c45b'
  },
  {
    apiTable: 'methods',
    apiKey: null,
    apiBasePath: 'habitatSite.methods',
    powerAppsTable: 'sdds_licensemethods',
    contentId: null,
    powerAppsKey: '80ce79d8-87fb-ec11-82e5-002248c5c45b'
  }
]

describe('The application extract processor: write-habitat-site-object', () => {
  beforeEach(() => jest.resetModules())

  it('does nothing if no application key found', async () => {
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data: {}, keys: [keys[0]] }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does nothing if the application and the licence are not found in the database', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.applications = {
      findOne: jest.fn(() => null)
    }
    models.licences = {
      findByPk: jest.fn(() => null)
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({
      data: { habitatSite: {} },
      keys: keys
    }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('creates a new habitat-site with an applicationId and a licenceId', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.licences = {
      findByPk: jest.fn(() => ({ id: '324b293c-a184-4cca-a2d7-2d1ac14e367e' }))
    }
    models.habitatSites = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data, keys }, null)
    expect(mockCreate).toHaveBeenCalledWith({
      applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      licenceId: '324b293c-a184-4cca-a2d7-2d1ac14e367e',
      habitatSite: {
        endDate: '2022-02-03',
        name: 'Destructive',
        startDate: '2022-01-29',
        activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24',
        speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        speciesSubjectId: '60ce79d8-87fb-ec11-82e5-002248c5c45b',
        methodIds: [
          '70ce79d8-87fb-ec11-82e5-002248c5c45b',
          '80ce79d8-87fb-ec11-82e5-002248c5c45b'
        ]
      },
      id: expect.any(String),
      sddsHabitatSiteId: '858b9fad-7106-ed11-82e4-002248c5c45b',
      updateStatus: 'U'
    })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
  })

  it('creates a new habitat-site with only a licenceId', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    models.applications = {
      findOne: () => null
    }
    models.licences = {
      findByPk: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.habitatSites = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data, keys }, null)
    expect(mockCreate).toHaveBeenCalledWith({
      licenceId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      habitatSite: {
        endDate: '2022-02-03',
        name: 'Destructive',
        startDate: '2022-01-29',
        activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24',
        speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        speciesSubjectId: '60ce79d8-87fb-ec11-82e5-002248c5c45b',
        methodIds: [
          '70ce79d8-87fb-ec11-82e5-002248c5c45b',
          '80ce79d8-87fb-ec11-82e5-002248c5c45b'
        ]
      },
      id: expect.any(String),
      sddsHabitatSiteId: '858b9fad-7106-ed11-82e4-002248c5c45b',
      updateStatus: 'U'
    })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
  })

  it('creates a new habitat-site with only an applicationId', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.licences = {
      findByPk: () => null
    }
    models.habitatSites = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data, keys }, null)
    expect(mockCreate).toHaveBeenCalledWith({
      applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      habitatSite: {
        endDate: '2022-02-03',
        name: 'Destructive',
        startDate: '2022-01-29',
        activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24',
        speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        speciesSubjectId: '60ce79d8-87fb-ec11-82e5-002248c5c45b',
        methodIds: [
          '70ce79d8-87fb-ec11-82e5-002248c5c45b',
          '80ce79d8-87fb-ec11-82e5-002248c5c45b'
        ]
      },
      id: expect.any(String),
      sddsHabitatSiteId: '858b9fad-7106-ed11-82e4-002248c5c45b',
      updateStatus: 'U'
    })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
  })

  it('makes an update on a found, pending habitat-site with a timestamp older than the extract start time', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.licences = {
      findByPk: () => null
    }
    models.habitatSites = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2020, 0, 1),
        habitatSite: data.habitatSite
      })),
      update: mockUpdate
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      habitatSite: data.habitatSite,
      applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      updateStatus: 'U'
    }, { returning: false, where: { id: '9487013e-abf5-4f42-95fa-15ad404570a1' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('makes an update on a found, unlocked habitat-site, if data has changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.licences = {
      findByPk: () => null
    }
    models.habitatSites = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1),
        habitatSite: {
          name: 'Destructive 2',
          startDate: '2022-01-29',
          endDate: '2022-02-03'
        }
      })),
      update: mockUpdate
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      habitatSite: data.habitatSite,
      applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      updateStatus: 'U'
    }, { returning: false, where: { id: '9487013e-abf5-4f42-95fa-15ad404570a1' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('ignores an update on a found, unlocked habitat-site, if data has not changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.licences = {
      findByPk: () => null
    }
    models.habitatSites = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1),
        habitatSite: data.habitatSite
      })),
      update: mockUpdate
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data, keys }, new Date())
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does not make an update on a found, pending habitat-site with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.licences = {
      findByPk: () => null
    }
    models.habitatSites = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2022, 0, 2),
        habitatSite: {
          name: 'Destructive 2',
          startDate: '2022-01-29',
          endDate: '2022-02-03'
        }
      })),
      update: mockUpdate
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data, keys }, new Date(2022, 0, 1))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.applications = {
      findOne: jest.fn(() => { throw new Error() })
    }
    const { writeHabitatSiteObject } = await import('../write-habitat-site-object.js')
    const result = await writeHabitatSiteObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
