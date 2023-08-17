jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */

const path = '/application/uuid/submit'
const req = { path }

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
      applicationId: 'f8c8c4bf-724b-4c25-934f-d1e7de1e2980'
    }
  }
}

jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ add: jest.fn(() => ({ id: 1 })) })),
  queueDefinitions: { LICENCE_RESEND_QUEUE: {} }
}))

let models
let postLicenceResendSubmit

describe('The postApplicationSubmit handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    postLicenceResendSubmit = (await import('../post-licence-resend-submit.js'))
      .default
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')
    SEQUELIZE.getSequelize = () => ({
      fn: jest
        .fn()
        .mockImplementation(() => new Date('October 13, 2023 11:13:00'))
    })
  })

  it('returns a 204 on a successful submission', async () => {
    const mockUpdate = jest.fn()
    models.applications = {
      findByPk: jest.fn(async () => ({
        dataValues: { id: 'bar', userId: 'foo' }
      })),
      update: mockUpdate
    }

    await postLicenceResendSubmit(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on not found', async () => {
    models.applications = { findByPk: jest.fn(async () => null) }
    await postLicenceResendSubmit(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with a query error', async () => {
    models.applications = {
      findByPk: jest.fn(async () => {
        throw new Error()
      })
    }
    await expect(async () =>
      postLicenceResendSubmit(context, req, h)
    ).rejects.toThrowError()
  })
})
