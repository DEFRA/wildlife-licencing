const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

describe('post-site-user-handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('returns a status 400 bad request if no user found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: jest.fn()
        }
      }
    }))
    const request = {
      payload:
        {
          userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
          siteId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
          role: 'USER'
        }
    }
    const context = {}
    const postSiteUser = (await import('../post-site-user.js')).default
    await postSiteUser(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('returns a status 400 bad request if no site found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        sites: {
          findByPk: jest.fn()
        }
      }
    }))
    const request = {
      payload:
        {
          userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
          siteId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
          role: 'USER'
        }
    }
    const context = {}
    const postSiteUser = (await import('../post-site-user.js')).default
    await postSiteUser(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('returns a status 409 if the site-user already exists', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        sites: {
          findByPk: jest.fn(() => ({ id: 'bbe0a988-2efe-41d5-901d-cad600fef2fd' }))
        },
        siteUsers: {
          findOne: jest.fn(() => ({ id: 'eb14153e-7425-4e4c-bcc4-acd8ee1933c3' }))
        }
      }
    }))
    const request = {
      payload:
        {
          userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
          siteId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
          role: 'USER'
        }
    }
    const context = {}
    const postSiteUser = (await import('../post-site-user.js')).default
    await postSiteUser(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(409)
  })

  it('returns a status 201 on a success create', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: jest.fn()
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: jest.fn(() => ({ id: '1ee0737e-f97d-4f79-8225-81b6014ce37e' }))
        },
        sites: {
          findByPk: jest.fn(() => ({ id: 'bbe0a988-2efe-41d5-901d-cad600fef2fd' }))
        },
        siteUsers: {
          findOne: jest.fn(() => null),
          create: jest.fn(() => ({
            dataValues: {
              userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
              siteId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
              id: 'eb14153e-7425-4e4c-bcc4-acd8ee1933c3',
              ...ts
            }
          }))
        }
      }
    }))
    const request = {
      payload:
        {
          userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
          siteId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
          role: 'USER'
        }
    }
    const context = {}
    const postSiteUser = (await import('../post-site-user.js')).default
    await postSiteUser(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('throws with any model error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const context = {}
    const request = {
      payload:
        {
          userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
          siteId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
          role: 'USER'
        }
    }
    const postSiteUser = (await import('../post-site-user.js')).default
    await expect(async () => {
      await postSiteUser(context, request, h)
    }).rejects.toThrow()
  })
})
