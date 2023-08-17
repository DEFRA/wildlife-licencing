const applicationUpload = {
  id: '5e790ab3-c37a-4e4c-a19d-97fb72cdbd42',
  applicationId: 'ee269288-9eae-4627-b4a8-671132cfb6b6',
  filetype: 'MAP',
  filename: 'map.txt',
  objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
  bucket: 'bucket-name',
  createdAt: '2022-08-02T11:53:01.291Z',
  updatedAt: '2022-08-02T12:04:04.004Z'
}

let codeFunc
let typeFunc
let h

const ts = {
  createdAt: { toISOString: () => '2022-08-02T11:53:01.291Z' },
  updatedAt: { toISOString: () => '2022-08-02T12:04:04.004Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

const context = {
  request: {
    params: {
      applicationId: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
      uploadId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732'
    }
  }
}

const req = {
  path: 'path',
  payload: {
    filetype: 'MAP',
    filename: 'map.txt',
    objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
    bucket: 'bucket-name'
  }
}

describe('getApplicationUpload handler', () => {
  beforeEach(async () => {
    jest.resetModules()
    jest.resetAllMocks()
    codeFunc = jest.fn()
    typeFunc = jest.fn(() => ({ code: codeFunc }))
    h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }
  })

  it('returns an application-upload and status 200 from the cache', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() =>
            Promise.resolve(JSON.stringify(applicationUpload))
          )
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({ models: {} }))
    const getApplicationFileUpload = (
      await import('../get-application-file-upload.js')
    ).default
    await getApplicationFileUpload(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      applicationId: 'ee269288-9eae-4627-b4a8-671132cfb6b6',
      bucket: 'bucket-name',
      objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
      createdAt: '2022-08-02T11:53:01.291Z',
      filename: 'map.txt',
      filetype: 'MAP',
      id: '5e790ab3-c37a-4e4c-a19d-97fb72cdbd42',
      updatedAt: '2022-08-02T12:04:04.004Z'
    })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('returns an application-upload and status 200 from the database', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => null),
          save: mockSave
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({
            id: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
          }))
        },
        applicationUploads: {
          findByPk: jest.fn(() => ({
            dataValues: Object.assign(applicationUpload, {
              ...ts
            })
          }))
        }
      }
    }))
    const getApplicationFileUpload = (
      await import('../get-application-file-upload.js')
    ).default
    await getApplicationFileUpload(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      applicationId: 'ee269288-9eae-4627-b4a8-671132cfb6b6',
      bucket: 'bucket-name',
      objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
      createdAt: '2022-08-02T11:53:01.291Z',
      filename: 'map.txt',
      filetype: 'MAP',
      id: '5e790ab3-c37a-4e4c-a19d-97fb72cdbd42',
      updatedAt: '2022-08-02T12:04:04.004Z'
    })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).toHaveBeenCalledWith('path', {
      applicationId: 'ee269288-9eae-4627-b4a8-671132cfb6b6',
      bucket: 'bucket-name',
      objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
      filename: 'map.txt',
      filetype: 'MAP',
      id: '5e790ab3-c37a-4e4c-a19d-97fb72cdbd42',
      ...tsR
    })
  })

  it('returns 404 if the application does not exist', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => null)
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const getApplicationFileUpload = (
      await import('../get-application-file-upload.js')
    ).default
    await getApplicationFileUpload(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns 404 if the application upload does not exist', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => null)
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({
            id: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
          }))
        },
        applicationUploads: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const getApplicationFileUpload = (
      await import('../get-application-file-upload.js')
    ).default
    await getApplicationFileUpload(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on error', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => {
            throw new Error()
          })
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({ models: {} }))
    const getApplicationFileUpload = (
      await import('../get-application-file-upload.js')
    ).default
    await expect(
      async () => await getApplicationFileUpload(context, req, h)
    ).rejects.toThrow()
  })
})
