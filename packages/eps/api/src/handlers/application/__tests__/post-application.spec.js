/*
 * Mock the hapi request object
 */
const path = 'user/uuid/application'
const req = {
  path,
  payload: {
    sddsId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
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
const context = { request: { params: { userId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' } } }

jest.mock('../../../model/sequentelize-model.js')

let models
let postApplication

const applicationJson = 'application/json'

describe('The postApplication handler', () => {
  beforeAll(async () => {
    models = (await import('../../../model/sequentelize-model.js')).models
    postApplication = (await import('../post-application.js')).default
  })

  it('returns a 201 on successful create', async () => {
    models.applications = { create: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    await postApplication(context, req, h)
    expect(models.applications.create).toHaveBeenCalledWith({
      id: expect.any(String),
      sddsId: req.payload.sddsId,
      userId: context.request.params.userId,
      application: (({ sddsId, ...l }) => l)(req.payload)
    })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 201 on successful create -- no sddsId', async () => {
    models.applications = { create: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    const req2 = Object.assign(req)
    delete req2.payload.sddsId
    await postApplication(context, req2, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 404 with an unknown userId', async () => {
    models.users = { findByPk: jest.fn(async () => null) }
    await postApplication(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    models.applications = { create: jest.fn(async () => { throw new Error() }) }
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    await expect(async () => {
      await postApplication(context, req, h)
    }).rejects.toThrow()
  })
})
