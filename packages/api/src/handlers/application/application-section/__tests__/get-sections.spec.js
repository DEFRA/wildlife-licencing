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
  request: {}
}

const request = {
  path: 'path',
  query: { role: 'USER' }
}

describe('get-section-handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('returns a status 404 if no applications found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findAll: jest.fn(() => [])
        }
      }
    }))
    const { getSectionsHandler } = await import('../get-sections.js')
    await getSectionsHandler('section-name')(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a status 200 with the section data', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findAll: jest.fn(() => [{
            dataValues: {
              application: {
                'section-name': { foo: 'bar' }
              },
              targetKeys: null
            }
          }])
        }
      }
    }))
    const { getSectionsHandler } = await import('../get-sections.js')
    await getSectionsHandler('section-name')(context, request, h)
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar' }])
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('returns a status 200 with the section data with target keys', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findAll: jest.fn(() => [{
            dataValues: {
              application: {
                'section-name': { foo: 'bar' }
              },
              targetKeys: [
                { foo: 'bar' }
              ]
            }
          }])
        }
      }
    }))
    const { getSectionsHandler } = await import('../get-sections.js')
    await getSectionsHandler('section-name', () => ({ key: 'data' }))(context, request, h)
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', key: 'data' }])
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('throws on a database error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findAll: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const { getSectionsHandler } = await import('../get-sections.js')
    await expect(async () => {
      await getSectionsHandler('section-name')(context, request, h)
    }).rejects.toThrow()
  })
})
