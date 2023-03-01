jest.spyOn(console, 'error').mockImplementation(() => null)

const data = {
  applicationDesignatedSites: {
    adviceFromNaturalEngland: false
  }
}

const keys = [
  {
    apiTable: 'applicationDesignatedSites',
    apiKey: null,
    apiBasePath: 'applicationDesignatedSites',
    powerAppsTable: 'sdds_designatedsiteses',
    contentId: null,
    powerAppsKey: '0397bc43-8db6-ed11-b597-0022481b53bf'
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'applicationDesignatedSites.applicationId',
    powerAppsTable: 'sdds_applications',
    contentId: null
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'applicationDesignatedSites.applicationId',
    powerAppsTable: 'sdds_applications',
    contentId: null,
    powerAppsKey: '34999b27-7cb6-ed11-b597-0022481b53bf'
  },
  {
    apiTable: 'designatedSites',
    apiKey: null,
    apiBasePath: 'applicationDesignatedSites.designatedSiteId',
    powerAppsTable: 'sdds_designatedsitenames',
    contentId: null,
    powerAppsKey: '97b171b3-55a9-ed11-aad1-0022481b53bf'
  }
]

describe('The designated site extract processor: write-application-designated-site-object', () => {
  beforeEach(() => jest.resetModules())

  it('does nothing if no application key found', async () => {
    const { writeApplicationDesignatedSiteObject } = await import('../write-application-designated-site-object.js')
    const result = await writeApplicationDesignatedSiteObject({ data: {}, keys: [keys[0]] }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does nothing if the application is not found in the database', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.applications = {
      findOne: jest.fn(() => null)
    }
    const { writeApplicationDesignatedSiteObject } = await import('../write-application-designated-site-object.js')
    const result = await writeApplicationDesignatedSiteObject({
      data: {},
      keys: keys
    }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('creates a new designated site', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.applicationDesignatedSites = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }
    const { writeApplicationDesignatedSiteObject } = await import('../write-application-designated-site-object.js')
    const result = await writeApplicationDesignatedSiteObject({ data, keys }, null)
    expect(mockCreate).toHaveBeenCalledWith({
      applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
      designatedSite: {
        adviceFromNaturalEngland: false
      },
      id: expect.any(String),
      designatedSiteId: '97b171b3-55a9-ed11-aad1-0022481b53bf',
      sddsDesignatedSiteId: '0397bc43-8db6-ed11-b597-0022481b53bf',
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
    models.applicationDesignatedSites = {
      findOne: jest.fn(() => ({
        id: '9900b9ab-fcee-476c-8f25-b8a32054e237',
        applicationId: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
        designatedSiteId: '97b171b3-55a9-ed11-aad1-0022481b53bf',
        designatedSite: {
          adviceFromNaturalEngland: true
        },
        sddsDesignatedSiteId: '0397bc43-8db6-ed11-b597-0022481b53bf',
        updateStatus: 'P',
        updatedAt: new Date(2020, 0, 1)
      })),
      update: mockUpdate
    }
    const { writeApplicationDesignatedSiteObject } = await import('../write-application-designated-site-object.js')
    const result = await writeApplicationDesignatedSiteObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      designatedSite: {
        adviceFromNaturalEngland: false
      },
      designatedSiteId: '97b171b3-55a9-ed11-aad1-0022481b53bf',
      updateStatus: 'U'
    }, { returning: false, where: { id: '9900b9ab-fcee-476c-8f25-b8a32054e237' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('makes an update on a found, unlocked permission, if data has changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.applicationDesignatedSites = {
      findOne: jest.fn(() => ({
        id: '9900b9ab-fcee-476c-8f25-b8a32054e237',
        applicationId: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
        designatedSiteId: '97b171b3-55a9-ed11-aad1-0022481b53bf',
        designatedSite: {
          adviceFromNaturalEngland: true
        },
        sddsDesignatedSiteId: '0397bc43-8db6-ed11-b597-0022481b53bf',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1)
      })),
      update: mockUpdate
    }
    const { writeApplicationDesignatedSiteObject } = await import('../write-application-designated-site-object.js')
    const result = await writeApplicationDesignatedSiteObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      designatedSite: {
        adviceFromNaturalEngland: false
      },
      designatedSiteId: '97b171b3-55a9-ed11-aad1-0022481b53bf',
      updateStatus: 'U'
    }, { returning: false, where: { id: '9900b9ab-fcee-476c-8f25-b8a32054e237' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('ignores an update on a found, unlocked permission, if data has not changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.applicationDesignatedSites = {
      findOne: jest.fn(() => ({
        id: '9900b9ab-fcee-476c-8f25-b8a32054e237',
        applicationId: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
        designatedSiteId: '97b171b3-55a9-ed11-aad1-0022481b53bf',
        designatedSite: {
          adviceFromNaturalEngland: false
        },
        sddsDesignatedSiteId: '0397bc43-8db6-ed11-b597-0022481b53bf',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1)
      })),
      update: mockUpdate
    }
    const { writeApplicationDesignatedSiteObject } = await import('../write-application-designated-site-object.js')
    const result = await writeApplicationDesignatedSiteObject({ data, keys }, new Date())
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does not make an update on a found, pending permission with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.applications = {
      findOne: jest.fn(() => ({ id: 'fedb14b6-53a8-ec11-9840-0022481aca85' }))
    }
    models.applicationDesignatedSites = {
      findOne: jest.fn(() => ({
        id: '9900b9ab-fcee-476c-8f25-b8a32054e237',
        applicationId: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
        designatedSiteId: '97b171b3-55a9-ed11-aad1-0022481b53bf',
        designatedSite: {
          adviceFromNaturalEngland: true
        },
        sddsDesignatedSiteId: '0397bc43-8db6-ed11-b597-0022481b53bf',
        updateStatus: 'P',
        updatedAt: new Date(2022, 0, 2)
      })),
      update: mockUpdate
    }
    const { writeApplicationDesignatedSiteObject } = await import('../write-application-designated-site-object.js')
    const result = await writeApplicationDesignatedSiteObject({ data, keys }, new Date(2022, 0, 1))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.applications = {
      findOne: jest.fn(() => { throw new Error() })
    }
    const { writeApplicationDesignatedSiteObject } = await import('../write-application-designated-site-object.js')
    const result = await writeApplicationDesignatedSiteObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
