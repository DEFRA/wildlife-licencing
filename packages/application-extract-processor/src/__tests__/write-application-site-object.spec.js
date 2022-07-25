
const keys = [
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'application',
    powerAppsTable: 'sdds_applications',
    contentId: null,
    powerAppsKey: 'fc1a9675-db01-ed11-82e5-002248c5c45b'
  },
  {
    apiTable: 'sites',
    apiKey: null,
    apiBasePath: 'application.sites',
    powerAppsTable: 'sdds_sites',
    contentId: null,
    powerAppsKey: '94d69d6f-db01-ed11-82e5-002248c5c45b'
  },
  {
    apiTable: 'sites',
    apiKey: null,
    apiBasePath: 'application.sites',
    powerAppsTable: 'sdds_sites',
    contentId: null,
    powerAppsKey: '97d69d6f-db01-ed11-82e5-002248c5c45b'
  }
]

const foundApplication = {
  id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
  sddsApplicationId: 'fc1a9675-db01-ed11-82e5-002248c5c45b',
  applications: { foo: 'bar' }
}

const foundSite = {
  id: '286759f9-268f-ec11-b400-000d3a8728b2',
  site: { foo: 'bar' },
  sddsSiteId: '94d69d6f-db01-ed11-82e5-002248c5c45b'
}

const foundApplicationSite = {
  id: '79015868-4149-420c-90f5-356dc2d06184',
  applicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939',
  siteId: '286759f9-268f-ec11-b400-000d3a8728b2',
  sddsApplicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939',
  sddsSiteId: '94d69d6f-db01-ed11-82e5-002248c5c45b'
}

describe('The application extract processor: write-application-site-object', () => {
  beforeEach(() => jest.resetModules())

  it('makes no change if an application-site has no sites', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: { findOne: jest.fn(() => null) }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({
      data: { },
      keys: [{
        apiTable: 'applications',
        apiKey: null,
        apiBasePath: 'application',
        powerAppsTable: 'sdds_applications',
        contentId: null,
        powerAppsKey: 'fc1a9675-db01-ed11-82e5-002248c5c45b'
      }]
    })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('makes no change if an application-site has no associated site', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        sites: { findOne: jest.fn(() => null) },
        applications: { findOne: jest.fn(() => foundApplication) }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({ data: { }, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('makes no change if an application-site is found using the power apps keys', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        sites: { findOne: jest.fn(() => foundSite) },
        applications: { findOne: jest.fn(() => foundApplication) },
        applicationSites: { findOne: jest.fn(() => foundApplicationSite) }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({ data: { }, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('updates with the power apps keys if an application-site is found using the api keys', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        sites: { findOne: jest.fn().mockReturnValueOnce(foundSite).mockReturnValue(null) },
        applications: { findOne: jest.fn(() => foundApplication) },
        applicationSites: { findOne: jest.fn().mockReturnValueOnce(null).mockReturnValueOnce(foundApplicationSite), update: mockUpdate }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({ data: { }, keys })
    expect(mockUpdate).toHaveBeenCalledWith({
      sddsApplicationId: 'fc1a9675-db01-ed11-82e5-002248c5c45b',
      sddsSiteId: '94d69d6f-db01-ed11-82e5-002248c5c45b'
    }, expect.any(Object))
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('creates a new application-site if existing one not found', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        sites: { findOne: jest.fn().mockReturnValueOnce(foundSite).mockReturnValue(null) },
        applications: { findOne: jest.fn(() => foundApplication) },
        applicationSites: { findOne: jest.fn(() => null), create: mockCreate }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({ data: { }, keys })
    const expected = {
      sddsApplicationId: 'fc1a9675-db01-ed11-82e5-002248c5c45b',
      sddsSiteId: '94d69d6f-db01-ed11-82e5-002248c5c45b',
      applicationId: foundApplication.id,
      siteId: foundSite.id,
      id: expect.any(String)
    }
    expect(mockCreate).toHaveBeenCalledWith(expected)
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
  })

  it('returns with an error on an exception', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: { findOne: jest.fn(() => { throw new Error() }) }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({ data: { }, keys })
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
