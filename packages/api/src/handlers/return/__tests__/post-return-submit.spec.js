jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = '/licence/uuid/return'
const req = {
  path
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
      returnId: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
      licenceId: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
    }
  }
}

jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ add: jest.fn(() => ({ id: 1 })) })),
  queueDefinitions: { RETURN_QUEUE: {} }
}))

describe('The postReturnSubmit handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 204 on successful submission', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({ fn: jest.fn().mockImplementation(() => new Date('October 13, 2023 11:13:00')) })
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: () => ({ dataValues: { id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae', licenceId: '7c3b13ef-c2fb-4955-942e-764593cf0ada' } }),
          update: mockUpdate
        }
      }
    }))
    const postReturnSubmit = (await import('../post-return-submit.js')).default
    await postReturnSubmit(context, req, h)
    expect(mockUpdate).toHaveBeenCalledWith({ userSubmission: new Date('October 13, 2023 11:13:00') }, { where: { id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae' } })
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on return not found (no return)', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: () => null
        }
      }
    }))
    const postReturnSubmit = (await import('../post-return-submit.js')).default
    await postReturnSubmit(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 404 on return not found (wrong licence)', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: () => ({
            dataValues: {
              id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
              licenceId: '8c3b13ef-c2fb-4955-942e-764593cf0ada'
            }
          })
        }
      }
    }))
    const postReturnSubmit = (await import('../post-return-submit.js')).default
    await postReturnSubmit(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const postReturnSubmit = (await import('../post-return-submit.js')).default
    await expect(async () => {
      await postReturnSubmit(context, req, h)
    }).rejects.toThrow()
  })
})
