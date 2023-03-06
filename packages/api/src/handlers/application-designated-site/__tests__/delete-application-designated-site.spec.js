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

describe('The deleteApplicationDesignatedSite handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 204 on a successful delete', async () => {
    const mockDelete = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: mockDelete
        }
      }
    }))

    const mockDestroy = jest.fn(() => 1)
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
        },
        applicationDesignatedSites: {
          destroy: mockDestroy
        }
      }
    }))

    const deleteApplicationDesignatedSite = (await import('../delete-application-designated-site.js')).default
    await deleteApplicationDesignatedSite(context, req, h)
    expect(mockDelete).toHaveBeenCalledWith('/application/54b5c443-e5e0-4d81-9daa-671a21bd88ca/designated-site/2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on nothing deleted', async () => {
    const mockDelete = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: mockDelete
        }
      }
    }))

    const mockDestroy = jest.fn(() => 0)
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
        },
        applicationDesignatedSites: {
          destroy: mockDestroy
        }
      }
    }))

    const deleteApplicationDesignatedSite = (await import('../delete-application-designated-site.js')).default
    await deleteApplicationDesignatedSite(context, req, h)
    expect(mockDelete).not.toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
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
    const deleteApplicationDesignatedSite = (await import('../delete-application-designated-site.js')).default
    await deleteApplicationDesignatedSite(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const deleteApplicationDesignatedSite = (await import('../delete-application-designated-site.js')).default
    await expect(async () => {
      await deleteApplicationDesignatedSite(context, req, h)
    }).rejects.toThrow()
  })
})
