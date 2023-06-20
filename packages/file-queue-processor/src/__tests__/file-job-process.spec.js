jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')
jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ process: jest.fn })),
  queueDefinitions: { FILE_QUEUE: {} }
}))

const applicationId = 'b1847e67-07fa-4c51-af03-cb51f5126939'

const job = {
  data: {
    id: '412d7297-643d-485b-8745-cc25a0e6ec0a',
    applicationId
  }
}

describe('The file job processor', () => {
  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  it('processes a job correctly', async () => {
    const mockRead = jest.fn(() => ({
      stream: 'byte-stream',
      bytes: 500
    }))
    const mockUpload = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: {
        S3: {
          readFileStream: mockRead
        }
      },
      GRAPH: {
        client: jest.fn(() => ({
          uploadFile: mockUpload
        }))
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUploads: {
          findByPk: jest.fn(() => ({
            bucket: 'bucket-name',
            objectKey: '123',
            filename: 'file.txt',
            applicationId
          }))
        },
        applications: {
          findByPk: jest.fn(() => ({
            application: {
              applicationReferenceNumber: 'APPLICATION_REFERENCE'
            }
          }))
        }
      }
    }))
    const { fileJobProcess } = await import('../file-job-process.js')
    await fileJobProcess(job)
    expect(mockUpload).toHaveBeenCalledWith('file.txt', 500, 'byte-stream', 'Application', '/APPLICATION_REFERENCE')
  })

  it('logs error and resolves with unrecoverable error - no record in database', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: {
        S3: {
          readFileStream: jest.fn()
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUploads: {
          findByPk: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const { fileJobProcess } = await import('../file-job-process.js')
    await expect(() => fileJobProcess(job)).resolves
  })

  it('rejects with recoverable error from AWS', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: {
        S3: {
          // eslint-disable-next-line no-throw-literal
          ReadFileStream: jest.fn(() => { throw { httpStatusCode: 500, message: 'recoverable error' } })
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUploads: {
          findByPk: jest.fn(() => ({
            bucket: 'bucket-name',
            objectKey: '123',
            filename: 'file.txt',
            applicationId
          }))
        },
        applications: {
          findByPk: jest.fn(() => ({
            application: {
              applicationReferenceNumber: 'APPLICATION_REFERENCE'
            }
          }))
        }
      }
    }))
    const { fileJobProcess } = await import('../file-job-process.js')
    await expect(fileJobProcess(job)).rejects.toThrow()
  })

  it('rejects with an unrecoverable error from AWS', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: {
        S3: {
          // eslint-disable-next-line no-throw-literal
          readFileStream: jest.fn(() => { throw { httpStatusCode: 400, message: 'unrecoverable error' } })
        }
      }
    }))

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUploads: {
          findByPk: jest.fn(() => ({
            bucket: 'bucket-name',
            objectKey: '123',
            filename: 'file.txt',
            applicationId
          }))
        },
        applications: {
          findByPk: jest.fn(() => ({
            application: {
              applicationReferenceNumber: 'APPLICATION_REFERENCE'
            }
          }))
        }
      }
    }))
    const { fileJobProcess } = await import('../file-job-process.js')
    await expect(fileJobProcess(job)).resolves
  })

  it('rejects with recoverable error from AZURE', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: {
        S3: {
          readFileStream: jest.fn()
        }
      },
      GRAPH: {
        client: jest.fn(() => ({
          uploadFile: jest.fn(() => { throw new Error() })
        }))
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUploads: {
          findByPk: jest.fn(() => ({
            bucket: 'bucket-name',
            objectKey: '123',
            filename: 'file.txt',
            applicationId
          }))
        },
        applications: {
          findByPk: jest.fn(() => ({
            application: {
              applicationReferenceNumber: 'APPLICATION_REFERENCE'
            }
          }))
        }
      }
    }))
    const { fileJobProcess } = await import('../file-job-process.js')
    await expect(fileJobProcess(job)).rejects.toThrow()
  })
})
