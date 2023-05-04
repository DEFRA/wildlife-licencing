jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')

jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ process: jest.fn })),
  queueDefinitions: { FILE_QUEUE: {} }
}))

const returnId = 'b1847e67-07fa-4c51-af03-cb51f5126939'

const job = {
  data: {
    id: '412d7297-643d-485b-8745-cc25a0e6ec0a',
    returnId
  }
}

describe('The file job processor', () => {
  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  it('processes a job correctly', async () => {
    const mockSend = jest.fn(() => ({
      Body: 'byte-stream',
      ContentLength: 500
    }))
    const mockPut = jest.fn()
    const mockUpload = jest.fn()
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: () => ({
        S3Client: {
          send: mockSend
        },
        GetObjectCommand: mockPut
      }),
      GRAPH: {
        client: jest.fn(() => ({
          uploadFile: mockUpload
        }))
      },
      SEQUELIZE: {
        getSequelize: () => ({ fn: jest.fn().mockImplementation(() => new Date('October 13, 2023 11:13:00')) })
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returnUploads: {
          findByPk: jest.fn(() => ({
            bucket: 'bucket-name',
            objectKey: '123',
            filename: 'file.txt',
            returnId
          })),
          update: mockUpdate
        },
        returns: {
          findByPk: jest.fn(() => ({
            licenceId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            returnData: {
              returnReferenceNumber: 'RETURN_REFERENCE'
            }
          }))
        },
        licences: {
          findByPk: jest.fn(() => ({
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10',
            licence: {
              licenceNumber: 'LICENCE_REFERENCE'
            }
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
    const { returnFileJobProcess } = await import('../return-file-job-process.js')
    await returnFileJobProcess(job)
    expect(mockUpload).toHaveBeenCalledWith('file.txt', 500, 'byte-stream', 'Application', '/APPLICATION_REFERENCE/LICENCE_REFERENCE/RETURN_REFERENCE')
    expect(mockUpdate).toHaveBeenCalledWith({ submitted: expect.any(Date) },
      { where: { id: '412d7297-643d-485b-8745-cc25a0e6ec0a' } })
  })

  it('logs error and resolves with unrecoverable error - no record in database', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: () => ({
        S3Client: {
          send: jest.fn()
        },
        GetObjectCommand: jest.fn()
      })
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returnUploads: {
          findByPk: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const { returnFileJobProcess } = await import('../return-file-job-process.js')
    await expect(() => returnFileJobProcess(job)).resolves
  })

  it('rejects with recoverable error from AWS', async () => {
    // eslint-disable-next-line no-throw-literal
    const mockSend = jest.fn(() => { throw { httpStatusCode: 500, message: 'recoverable error' } })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: () => ({
        S3Client: {
          send: mockSend
        },
        GetObjectCommand: jest.fn()
      })
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returnUploads: {
          findByPk: jest.fn(() => ({
            bucket: 'bucket-name',
            objectKey: '123',
            filename: 'file.txt',
            returnId
          }))
        },
        returns: {
          findByPk: jest.fn(() => ({
            licenceId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            returnData: {
              returnReferenceNumber: 'RETURN_REFERENCE'
            }
          }))
        },
        licences: {
          findByPk: jest.fn(() => ({
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10',
            licence: {
              licenceNumber: 'LICENCE_REFERENCE'
            }
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
    const { returnFileJobProcess } = await import('../return-file-job-process.js')
    await expect(returnFileJobProcess(job)).rejects.toThrow()
  })

  it('rejects with an unrecoverable error from AWS', async () => {
    // eslint-disable-next-line no-throw-literal
    const mockSend = jest.fn(() => { throw { httpStatusCode: 400, message: 'unrecoverable error' } })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: () => ({
        S3Client: {
          send: mockSend
        },
        GetObjectCommand: jest.fn()
      })
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returnUploads: {
          findByPk: jest.fn(() => ({
            bucket: 'bucket-name',
            objectKey: '123',
            filename: 'file.txt',
            returnId
          }))
        },
        returns: {
          findByPk: jest.fn(() => ({
            licenceId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            returnData: {
              returnReferenceNumber: 'RETURN_REFERENCE'
            }
          }))
        },
        licences: {
          findByPk: jest.fn(() => ({
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10',
            licence: {
              licenceNumber: 'LICENCE_REFERENCE'
            }
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
    const { returnFileJobProcess } = await import('../return-file-job-process.js')
    await expect(returnFileJobProcess(job)).resolves
  })

  it('rejects with recoverable error from AZURE', async () => {
    const mockSend = jest.fn(() => ({
      Body: 'byte-stream',
      ContentLength: 500
    }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      AWS: () => ({
        S3Client: {
          send: mockSend
        },
        GetObjectCommand: jest.fn()
      }),
      GRAPH: {
        client: jest.fn(() => ({
          uploadFile: jest.fn(() => { throw new Error() })
        }))
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returnUploads: {
          findByPk: jest.fn(() => ({
            bucket: 'bucket-name',
            objectKey: '123',
            filename: 'file.txt',
            returnId
          }))
        },
        returns: {
          findByPk: jest.fn(() => ({
            licenceId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            returnData: {
              returnReferenceNumber: 'RETURN_REFERENCE'
            }
          }))
        },
        licences: {
          findByPk: jest.fn(() => ({
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10',
            licence: {
              licenceNumber: 'LICENCE_REFERENCE'
            }
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
    const { returnFileJobProcess } = await import('../return-file-job-process.js')
    await expect(returnFileJobProcess(job)).rejects.toThrow()
  })
})
