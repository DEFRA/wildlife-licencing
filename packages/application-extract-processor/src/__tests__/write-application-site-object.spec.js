const data = {
  application: {
    id: '2b6759f9-268f-ec11-b400-000d3a8728b2-Trackit',
    sites: [
      {
        id: '286759f9-268f-ec11-b400-000d3a8728b2-Trackit'
      }
    ]
  }
}

const foundApplication = {
  dataValues: {
    id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
    userId: '903ecac0-f4cb-4fd8-a853-557a02ddde0c',
    sddsApplicationId: '2b6759f9-268f-ec11-b400-000d3a8728b2',
    applications: { foo: 'bar' }
  }
}

const foundSite = {
  dataValues: {
    id: '286759f9-268f-ec11-b400-000d3a8728b2',
    userId: '903ecac0-f4cb-4fd8-a853-557a02ddde0c',
    site: { foo: 'bar' },
    sddsSiteId: '286759f9-268f-ec11-b400-000d3a8728b2'
  }
}

const foundApplicationSite = {
  dataValues: {
    id: '79015868-4149-420c-90f5-356dc2d06184',
    userId: '903ecac0-f4cb-4fd8-a853-557a02ddde0c',
    applicationId: 'b1847e67-07fa-4c51-af03-cb51f5126939',
    siteId: '286759f9-268f-ec11-b400-000d3a8728b2',
    sddsApplicationId: '2b6759f9-268f-ec11-b400-000d3a8728b2',
    sddsSiteId: '286759f9-268f-ec11-b400-000d3a8728b2'
  }
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
    const result = await writeApplicationSiteObject({ data: { application: { id: '2b6759f9-268f-ec11-b400-000d3a8728b2', sites: [] } } })
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
    const result = await writeApplicationSiteObject({ data })
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
    const result = await writeApplicationSiteObject({ data })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('updates with the power apps keys if an application-site is found using the api keys', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        sites: { findOne: jest.fn(() => foundSite) },
        applications: { findOne: jest.fn(() => foundApplication) },
        applicationSites: { findOne: jest.fn().mockReturnValueOnce(null).mockReturnValueOnce(foundApplicationSite), update: mockUpdate }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({ data })
    expect(mockUpdate).toHaveBeenCalledWith({
      sddsApplicationId: data.application.id,
      sddsSiteId: data.application.sites[0].id
    }, expect.any(Object))
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('creates a new application-site if existing one not found', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        sites: { findOne: jest.fn(() => foundSite) },
        applications: { findOne: jest.fn(() => foundApplication) },
        applicationSites: { findOne: jest.fn(() => null), create: mockCreate }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({ data })
    const expected = {
      sddsApplicationId: data.application.id,
      sddsSiteId: data.application.sites[0].id,
      applicationId: foundApplication.dataValues.id,
      siteId: foundSite.dataValues.id,
      id: expect.any(String)
    }
    expect(mockCreate).toHaveBeenCalledWith(expected)
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
  })

  it('assigns a user from the application to the site', async () => {
    const newFoundSite = Object.assign({}, foundSite)
    newFoundSite.dataValues.userId = null
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        sites: { findOne: jest.fn(() => newFoundSite), update: mockUpdate },
        applications: { findOne: jest.fn(() => foundApplication) },
        applicationSites: { findOne: jest.fn(() => foundApplicationSite) }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    await writeApplicationSiteObject({ data })
    expect(mockUpdate).toHaveBeenCalledWith({
      userId: foundApplication.dataValues.userId
    }, { where: { id: newFoundSite.dataValues.id } })
  })

  it('returns with an error on an exception', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: { findOne: jest.fn(() => { throw new Error() }) }
      }
    }))
    const { writeApplicationSiteObject } = await import('../write-application-site-object.js')
    const result = await writeApplicationSiteObject({ data })
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
