/*
 * Mock the hapi request object
 */
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
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = { request: { params: {} } }

jest.mock('../../../model/sequentelize-model.js')

let models
let postUser

describe('The postUser handler', () => {
  beforeAll(async () => {
    models = (await import('../../../model/sequentelize-model.js')).models
    postUser = (await import('../post-user')).default
  })

  it('returns a 201 on successful create', async () => {
    models.users = { create: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    await postUser(context, req, h)
    expect(models.users.create).toHaveBeenCalledWith({ id: expect.any(String), sddsId })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 201 on successful create -- sddsId null', async () => {
    models.users = { create: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    await postUser(context, { path, payload: {} }, h)
    expect(models.users.create).toHaveBeenCalledWith({ id: expect.any(String), sddsId: null })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('throws with a create query error', async () => {
    models.users = { create: jest.fn(async () => { throw Error() }) }
    await expect(async () => {
      await postUser(context, req, h)
    }).rejects.toThrow()
  })
})
