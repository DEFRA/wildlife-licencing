jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path =
  '/application/54b5c443-e5e0-4d81-9daa-671a21bd88ca/designated-site/2ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
const req = {
  path,
  payload: {
    designatedSiteId: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
    permissionFromOwner: true
  }
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      applicationId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
      applicationDesignatedSiteId: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
    }
  }
}

const applicationJson = 'application/json'

describe('The getApplicationDesignatedSite handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 200 on a successful fetch from the database', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave,
          restore: () => null
        }
      }
    }))

    const mockFindByPk = jest.fn(async () => ({
      dataValues: { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...ts }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
        },
        applicationDesignatedSites: {
          findByPk: mockFindByPk
        }
      }
    }))

    const getApplicationDesignatedSite = (
      await import('../get-application-designated-site.js')
    ).default
    await getApplicationDesignatedSite(context, req, h)
    expect(mockSave).toHaveBeenCalledWith(
      '/application/54b5c443-e5e0-4d81-9daa-671a21bd88ca/designated-site/2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
      { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR }
    )
    expect(h.response).toHaveBeenCalledWith({
      id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 200 on a successful fetch from the cache', async () => {
    jest.doMock('@defra/wls-database-model', () => ({ models: null }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () =>
            JSON.stringify({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f' })
        }
      }
    }))

    const getApplicationDesignatedSite = (
      await import('../get-application-designated-site.js')
    ).default
    await getApplicationDesignatedSite(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f'
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 on application not found', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => null
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => null
        },
        designatedSites: {
          findByPk: () => ({ id: '2342fce0-3067-4ca5-ae7a-23cae648e45c' })
        }
      }
    }))
    const getApplicationDesignatedSite = (
      await import('../get-application-designated-site.js')
    ).default
    await getApplicationDesignatedSite(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 404 on application designated site not found', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => null
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationDesignatedSites: {
          findByPk: () => null
        },
        applications: {
          findByPk: () => ({ id: '2342fce0-3067-4ca5-ae7a-23cae648e45c' })
        }
      }
    }))
    const getApplicationDesignatedSite = (
      await import('../get-application-designated-site.js')
    ).default
    await getApplicationDesignatedSite(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => null
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => {
            throw new Error()
          }
        }
      }
    }))
    const getApplicationDesignatedSite = (
      await import('../get-application-designated-site.js')
    ).default
    await expect(async () => {
      await getApplicationDesignatedSite(context, req, h)
    }).rejects.toThrow()
  })
})
