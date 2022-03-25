/*
 * Mock the hapi request object
 */
const path = 'user/uuid/site/uuid'
const req = {
  path,
  payload: {
    proposalDescription: 'a proposal',
    detailsOfConvictions: 'convictions'
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
      userId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77',
      siteId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
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
let putSite
let cache
const applicationJson = 'application/json'

describe('The putSite handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    putSite = (await import('../put-site.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar', ...ts } })) }
    models.sites = {
      findOrCreate: jest.fn(async () => ([{
        dataValues:
          {
            id: context.request.params.siteId,
            userId: context.request.params.userId,
            ...ts
          }
      }, true]))
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putSite(context, req, h)
    expect(models.sites.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: expect.any(String),
        userId: context.request.params.userId,
        updateStatus: 'L',
        site: (({ ...l }) => l)(req.payload)
      },
      where: {
        id: context.request.params.siteId
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, { id: context.request.params.siteId, ...tsR })
    expect(cache.delete).toHaveBeenCalledWith(`/user/${context.request.params.userId}/sites`)
    expect(h.response).toHaveBeenCalledWith({ id: context.request.params.siteId, ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar', ...ts } })) }
    models.sites = {
      findOrCreate: jest.fn(async () => ([{}, false])),
      update: jest.fn(async () => ([1, [{
        dataValues: {
          id: context.request.params.siteId,
          userId: context.request.params.userId,
          ...ts
        }
      }]]))
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putSite(context, req, h)
    expect(models.sites.update).toHaveBeenCalledWith({
      updateStatus: 'L',
      site: (({ ...l }) => l)(req.payload)
    },
    { returning: true, where: { id: context.request.params.siteId } })
    expect(cache.save).toHaveBeenCalledWith(path, { id: context.request.params.siteId, ...tsR })
    expect(cache.delete).toHaveBeenCalledWith(`/user/${context.request.params.userId}/sites`)
    expect(h.response).toHaveBeenCalledWith({ id: context.request.params.siteId, ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 where user not found', async () => {
    cache.save = jest.fn()
    cache.delete = jest.fn()
    models.users = { findByPk: jest.fn(async () => null) }
    await putSite(context, req, h)
    expect(cache.save).not.toHaveBeenCalled()
    expect(cache.delete).not.toHaveBeenCalled()
    expect(h.response).toHaveBeenCalled()
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert query error', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.sites = { findOrCreate: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await putSite(context, req, h)
    }).rejects.toThrow()
  })

  it('throws with an update query error', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.sites = {
      findOrCreate: jest.fn(async () => ([{}, false])),
      update: jest.fn(async () => { throw new Error() })
    }
    await expect(async () => {
      await putSite(context, req, h)
    }).rejects.toThrow()
  })
})
