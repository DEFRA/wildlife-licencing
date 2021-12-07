/*
 * Mock the hapi request object
 */
const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
const sddsId = '1e470963-e8bf-41f5-9b0b-52d19c21cb76'
const path = 'user/uuid'
const req = { path, payload: { sddsId } }

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const context = { request: { params: { userId: uuid } } }

jest.mock('../../../model/sequentelize-model.js')

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

let models
let putUser
let cache
const applicationJson = 'application/json'
describe('The putUser handler', () => {
  beforeAll(async () => {
    models = (await import('../../../model/sequentelize-model.js')).models
    putUser = (await import('../put-user')).default
    cache = (await import('../../../services/cache.js')).cache
  })

  it('returns a 201 on successful create', async () => {
    models.users = { findOrCreate: jest.fn(async () => ([{ dataValues: { id: uuid, ...ts } }, true])) }
    cache.save = jest.fn()
    await putUser(context, req, h)
    expect(models.users.findOrCreate).toHaveBeenCalledWith({
      defaults: { sddsId },
      where: { id: uuid }
    })
    expect(cache.save).toHaveBeenCalledWith(path, { id: uuid, ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: uuid, ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 201 on successful create - sddsId is undefined', async () => {
    models.users = { findOrCreate: jest.fn(async () => ([{ dataValues: { foo: 'bar', ...ts } }, true])) }
    cache.save = jest.fn()
    await putUser(context, { path, payload: {} }, h)
    expect(models.users.findOrCreate).toHaveBeenCalledWith({
      defaults: { sddsId: null },
      where: { id: uuid }
    })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key', async () => {
    models.users = {
      findOrCreate: jest.fn(async () => ([{ dataValues: { } }, false])),
      update: jest.fn(async () => ([1, [{ dataValues: { id: uuid, ...ts } }]]))
    }
    cache.save = jest.fn()
    await putUser(context, req, h)
    expect(models.users.update).toHaveBeenCalledWith({ sddsId }, {
      returning: true, where: { id: uuid }
    })
    expect(cache.save).toHaveBeenCalledWith(path, { id: uuid, ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: uuid, ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 200 with an existing key -- sddsId is null', async () => {
    models.users = {
      findOrCreate: jest.fn(async () => ([{ dataValues: { foo: 'bar', ...ts } }, false])),
      update: jest.fn(async () => ([1, [{ dataValues: { foo: 'bar', ...ts } }]]))
    }
    cache.restore = jest.fn()
    cache.save = jest.fn()
    await putUser(context, { path, payload: {} }, h)
    expect(models.users.update).toHaveBeenCalledWith({ sddsId: null }, {
      returning: true, where: { id: uuid }
    })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws with an insert query error', async () => {
    models.users = { findOrCreate: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await putUser(context, req, h)
    }).rejects.toThrow()
  })

  it('throws with an update query error', async () => {
    models.users = {
      findOrCreate: jest.fn(async () => ([{ dataValues: { foo: 'bar' } }, false])),
      update: jest.fn(async () => { throw new Error() })
    }
    await expect(async () => {
      await putUser(context, req, h)
    }).rejects.toThrow()
  })
})
