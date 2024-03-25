/*
 * Mock the hapi request object
 */
const path = 'user-organisation/uuid'
const req = {
  path,
  payload: {
    userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
    organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
    relationship: 'Employee'
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
      userOrganisationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
    }
  }
}

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

jest.mock('@defra/wls-database-model')

let models
let putUserOrganisation
let cache
const applicationJson = 'application/json'

describe('The updateOrganisation handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    putUserOrganisation = (await import('../put-user-organisation.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.userOrganisations = {
      findOrCreate: jest.fn(async () => [{
        dataValues: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
          userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
          organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
          relationship: 'Employee',
          ...ts
        }
      }, true])
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putUserOrganisation(context, req, h)
    expect(models.userOrganisations.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
        userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
        organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
        relationship: 'Employee'
      },
      where: {
        id: context.request.params.userOrganisationId
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
      userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
      relationship: 'Employee',
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
      userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
      relationship: 'Employee',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key', async () => {
    models.userOrganisations = {
      findOrCreate: jest.fn(async () => ([{
        dataValues: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
          userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
          organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
          relationship: 'Employee',
          ...ts
        }
      }, false]))
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putUserOrganisation(context, req, h)
    expect(models.userOrganisations.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
        userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
        organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
        relationship: 'Employee'
      },
      where: {
        id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
      userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
      relationship: 'Employee',
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
      userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      organisationId: '97496a5a-75cc-4f68-ad57-06f2882c7b9a',
      relationship: 'Employee',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(202)
  })

  it('throws with an query error', async () => {
    models.userOrganisations = { findOrCreate: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await putUserOrganisation(context, req, h)
    }).rejects.toThrow()
  })
})
