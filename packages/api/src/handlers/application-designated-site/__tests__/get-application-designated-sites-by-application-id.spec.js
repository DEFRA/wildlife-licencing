jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path =
  '/application/54b5c443-e5e0-4d81-9daa-671a21bd88ca/designated-sites'
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

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      applicationId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca'
    }
  }
}

const applicationJson = 'application/json'

describe('The getApplicationDesignatedSiteByApplicationId handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 200 on a successful fetch', async () => {
    const mockFindAll = jest.fn(async () => [
      { dataValues: { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...ts } }
    ])
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
        },
        applicationDesignatedSites: {
          findAll: mockFindAll
        }
      }
    }))
    const getApplicationDesignatedSites = (
      await import('../get-application-designated-sites-by-application-id.js')
    ).default
    await getApplicationDesignatedSites(context, req, h)
    expect(h.response).toHaveBeenCalledWith([
      {
        createdAt: '2021-12-07T09:50:04.666Z',
        id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
        updatedAt: '2021-12-07T09:50:04.666Z'
      }
    ])
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
    const getApplicationDesignatedSites = (
      await import('../get-application-designated-sites-by-application-id.js')
    ).default
    await getApplicationDesignatedSites(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => {
            throw new Error()
          }
        }
      }
    }))
    const getApplicationDesignatedSites = (
      await import('../get-application-designated-sites-by-application-id.js')
    ).default
    await expect(async () => {
      await getApplicationDesignatedSites(context, req, h)
    }).rejects.toThrow()
  })
})
