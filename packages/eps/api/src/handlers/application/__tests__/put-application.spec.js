/*
 * Mock the hapi request object
 */
const path = 'user/uuid/application/uuid'
const req = {
  path,
  payload: {
    sddsId: '1e470963-e8bf-41f5-9b0b-52d19c21cb79',
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
      applicationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
    }
  }
}

jest.mock('../../../model/sequentelize-model.js')

let models
let putApplication
let cache
const applicationJson = 'application/json'

describe('The putApplication handler', () => {
  beforeAll(async () => {
    models = (await import('../../../model/sequentelize-model.js')).models
    putApplication = (await import('../put-application.js')).default
    cache = (await import('../../../services/cache.js')).cache
  })

  it('returns a 201 on successful create', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.applications = {
      findOrCreate: jest.fn(async () => ([{
        dataValues:
          {
            id: context.request.params.applicationId,
            userId: context.request.params.userId
          }
      }, true]))
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putApplication(context, req, h)
    expect(models.applications.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: expect.any(String),
        sddsId: req.payload.sddsId,
        userId: context.request.params.userId,
        application: (({ sddsId, ...l }) => l)(req.payload)
      },
      where: {
        id: context.request.params.applicationId
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, { id: context.request.params.applicationId, userId: context.request.params.userId })
    expect(cache.delete).toHaveBeenCalledWith(`/user/${context.request.params.userId}/applications`)
    expect(h.response).toHaveBeenCalledWith({ id: context.request.params.applicationId, userId: context.request.params.userId })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.applications = {
      findOrCreate: jest.fn(async () => ([{}, false])),
      update: jest.fn(async () => ([1, [{
        dataValues: {
          id: context.request.params.applicationId,
          userId: context.request.params.userId
        }
      }]]))
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putApplication(context, req, h)
    expect(models.applications.update).toHaveBeenCalledWith({
      application: (({ sddsId, ...l }) => l)(req.payload),
      sddsId: req.payload.sddsId
    },
    { returning: true, where: { id: context.request.params.applicationId } })
    expect(cache.save).toHaveBeenCalledWith(path, { id: context.request.params.applicationId, userId: context.request.params.userId })
    expect(cache.delete).toHaveBeenCalledWith(`/user/${context.request.params.userId}/applications`)
    expect(h.response).toHaveBeenCalledWith({ id: context.request.params.applicationId, userId: context.request.params.userId })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 201 on successful create -- no sddsId', async () => {
    cache.save = jest.fn()
    cache.delete = jest.fn()
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.applications = { findOrCreate: jest.fn(async () => ([{ dataValues: { foo: 'bar' } }, true])) }
    const req2 = Object.assign(req)
    delete req2.payload.sddsId
    await putApplication(context, req2, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key -- no sddsId', async () => {
    cache.save = jest.fn()
    cache.delete = jest.fn()
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.applications = {
      findOrCreate: jest.fn(async () => ([{}, false])),
      update: jest.fn(async () => ([1, [{ dataValues: { foo: 'bar' } }]]))
    }
    const req2 = Object.assign(req)
    delete req2.payload.sddsId
    await putApplication(context, req2, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 where user not found', async () => {
    cache.save = jest.fn()
    cache.delete = jest.fn()
    models.users = { findByPk: jest.fn(async () => null) }
    await putApplication(context, req, h)
    expect(cache.save).not.toHaveBeenCalled()
    expect(cache.delete).not.toHaveBeenCalled()
    expect(h.response).toHaveBeenCalled()
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert query error', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.applications = { findOrCreate: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await putApplication(context, req, h)
    }).rejects.toThrow()
  })

  it('throws with an update query error', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.applications = {
      findOrCreate: jest.fn(async () => ([{}, false])),
      update: jest.fn(async () => { throw new Error() })
    }
    await expect(async () => {
      await putApplication(context, req, h)
    }).rejects.toThrow()
  })
})
