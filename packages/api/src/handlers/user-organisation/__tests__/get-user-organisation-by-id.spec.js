jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = 'user-organisation/uuid/'
const req = {
  path
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
      userOrganisationId: '2bf9a873-45b2-48a5-a9b4-ca07766804ae'
    }
  }
}

const applicationJson = 'application/json'

describe('The getUserOrganisation handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 200 on successful fetch from the cache', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => JSON.stringify({
            id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
            userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
            organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
            relationship: 'Employee'
          })
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({}))
    const getUserOrganisation = (await import('../get-user-organisation-by-id.js')).default
    await getUserOrganisation(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
      organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
      relationship: 'Employee'
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 200 on successful fetch', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => null,
          save: mockSave
        }
      }
    }))

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        userOrganisations: {
          findByPk: () => ({
            dataValues: {
              id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
              userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
              organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
              relationship: 'Employee',
              ...ts
            }
          })
        }
      }
    }))

    const getUserOrganisation = (await import('../get-user-organisation-by-id.js')).default
    await getUserOrganisation(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
      organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
      relationship: 'Employee',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(mockSave).toHaveBeenCalledWith('user-organisation/uuid/', expect.objectContaining({
      organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
      relationship: 'Employee',
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
    }))
  })

  it('returns a 404 on user-organisation not found (no return)', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => null
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        userOrganisations: {
          findByPk: () => null
        }
      }
    }))
    const getUserOrganisation = (await import('../get-user-organisation-by-id.js')).default
    await getUserOrganisation(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an query error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        userOrganisations: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const getUserOrganisation = (await import('../get-user-organisation-by-id.js')).default
    await expect(async () => {
      await getUserOrganisation(context, req, h)
    }).rejects.toThrow()
  })
})
