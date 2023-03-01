jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = '/application/54b5c443-e5e0-4d81-9daa-671a21bd88ca/designated-site/2ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
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

describe('The putApplicationDesignatedSite handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 201 on successful create', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave
        }
      }
    }))

    const mockFindOrCreate = jest.fn(async () => [{ dataValues: { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...ts } }, true])
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
        },
        applicationDesignatedSites: {
          findOrCreate: mockFindOrCreate
        },
        designatedSites: {
          findByPk: () => ({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', json: { siteType: 10000001 } })
        }
      }
    }))

    const putApplicationDesignatedSite = (await import('../put-application-designated-site.js')).default

    await putApplicationDesignatedSite(context, req, h)
    expect(mockFindOrCreate).toHaveBeenCalledWith({
      where: {
        id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
      },
      defaults: {
        applicationId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        designatedSiteId: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
        designatedSiteType: 10000001,
        designatedSite: {
          permissionFromOwner: true
        },
        id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        updateStatus: 'L'
      }
    })
    expect(mockSave).toHaveBeenCalledWith('/application/54b5c443-e5e0-4d81-9daa-671a21bd88ca/designated-site/2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 on successful update', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave
        }
      }
    }))

    const mockUpdate = jest.fn(async () => [null, [{ dataValues: { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...ts } }]])
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
        },
        applicationDesignatedSites: {
          findOrCreate: () => [null, false],
          update: mockUpdate
        },
        designatedSites: {
          findByPk: () => ({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', json: { siteType: 10000001 } })
        }
      }
    }))

    const putApplicationDesignatedSite = (await import('../put-application-designated-site.js')).default
    await putApplicationDesignatedSite(context, req, h)
    expect(mockSave).toHaveBeenCalledWith('/application/54b5c443-e5e0-4d81-9daa-671a21bd88ca/designated-site/2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 on application not found', async () => {
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
    const putApplicationDesignatedSite = (await import('../put-application-designated-site.js')).default
    await putApplicationDesignatedSite(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 400 on designated site not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        designatedSites: {
          findByPk: () => null
        },
        applications: {
          findByPk: () => ({ id: '2342fce0-3067-4ca5-ae7a-23cae648e45c' })
        }
      }
    }))
    const putApplicationDesignatedSite = (await import('../put-application-designated-site.js')).default
    await putApplicationDesignatedSite(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('throws with an insert error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const putApplicationDesignatedSite = (await import('../put-application-designated-site.js')).default
    await expect(async () => {
      await putApplicationDesignatedSite(context, req, h)
    }).rejects.toThrow()
  })
})
