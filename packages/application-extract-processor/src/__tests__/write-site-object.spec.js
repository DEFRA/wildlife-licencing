const data = {
  sites: {
    name: 'FLAT 2 Birmingham rd',
    address: {
      addrline1: 'string',
      addrline2: 'string',
      addrline3: 'string',
      county: 'United Kingdom',
      town: 'LONDON',
      postcode: 'B68 6PG'
    }
  }
}

const keys = [{
  apiTable: 'sites',
  apiKey: 'ddf7eec2-9893-445a-b301-14730a0ff2f3',
  powerAppsTable: 'sdds_sites',
  powerAppsKey: 'add63e12-510f-ec11-b6e6-000d3a0cc807'
}]

const findOneResult = {
  dataValues: {
    id: '9487013e-abf5-4f42-95fa-15ad404570a1',
    updateStatus: 'P',
    updatedAt: new Date(2020, 0, 1),
    site: { ...data.sites }
  }
}

describe('The application extract processor: write-site-object', () => {
  beforeEach(() => jest.resetModules())

  it('makes an update on a found, pending site with a timestamp older than the extract start time', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: { sites: { findOne: jest.fn(() => findOneResult), update: mockUpdate } }
    }))
    const { writeSiteObject } = await import('../write-site-object.js')
    const result = await writeSiteObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
    expect(mockUpdate).toHaveBeenCalledWith({ site: { ...data.sites }, targetKeys: keys[0], updateStatus: 'U' }, expect.any(Object))
  })

  it('makes an update on a found, unlocked site, if data has changed', async () => {
    const mockUpdate = jest.fn()
    const findChangedResult = Object.assign({}, findOneResult)
    findChangedResult.dataValues.site.gridReference = '7615255'
    jest.doMock('@defra/wls-database-model', () => ({
      models: { sites: { findOne: jest.fn(() => findChangedResult), update: mockUpdate } }
    }))
    const { writeSiteObject } = await import('../write-site-object.js')
    const result = await writeSiteObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
    expect(mockUpdate).toHaveBeenCalledWith({ site: { ...data.sites }, targetKeys: keys[0], updateStatus: 'U' }, expect.any(Object))
  })

  it('ignores an update on a found, unlocked site, if data has not changed)', async () => {
    const mockUpdate = jest.fn()
    const unlockedResult = Object.assign({}, findOneResult)
    unlockedResult.dataValues.updateStatus = 'U'
    delete unlockedResult.dataValues.site.gridReference // Because not cloned deep
    jest.doMock('@defra/wls-database-model', () => ({
      models: { sites: { findOne: jest.fn(() => unlockedResult), update: mockUpdate } }
    }))
    const { writeSiteObject } = await import('../write-site-object.js')
    const result = await writeSiteObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
    expect(mockUpdate).not.toHaveBeenCalledWith()
  })

  it('does not make an update on a found, pending site with a timestamp newer than the extract', async () => {
    const mockUpdate = jest.fn()
    const updatedResult = Object.assign({}, findOneResult)
    updatedResult.dataValues.updatedAt = new Date(2022, 0, 1)
    updatedResult.dataValues.updateStatus = 'P'
    jest.doMock('@defra/wls-database-model', () => ({
      models: { sites: { findOne: jest.fn(() => updatedResult), update: mockUpdate } }
    }))
    const { writeSiteObject } = await import('../write-site-object.js')
    const result = await writeSiteObject({ data, keys }, new Date(2021, 0, 1))
    expect(result).toEqual({ error: 0, insert: 0, pending: 1, update: 0 })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('makes an insert on a not-found site', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: { sites: { findOne: jest.fn(() => null), create: mockCreate } }
    }))
    const { writeSiteObject } = await import('../write-site-object.js')
    const result = await writeSiteObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      sddsSiteId: 'add63e12-510f-ec11-b6e6-000d3a0cc807',
      site: { ...data.sites },
      targetKeys: expect.any(Object),
      updateStatus: 'U'
    })
  })

  it('records an error on an exception', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: { sites: { findOne: jest.fn(() => { throw new Error() }) } }
    }))
    const { writeSiteObject } = await import('../write-site-object.js')
    const result = await writeSiteObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
