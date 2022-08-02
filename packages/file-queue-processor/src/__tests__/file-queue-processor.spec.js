describe('The wrapper: file-queue-processor', () => {
  afterAll(done => {
    jest.clearAllMocks()
    done()
  })

  it('runs initialisation', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('../worker.js')
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-connectors-lib', () => ({
          AWS: () => ({ S3Client: jest.fn(), GetObjectCommand: jest.fn() }),
          SEQUELIZE: { DataTypes: 'foo', QueryTypes: 'foo' },
          REDIS: { initialiseConnection: jest.fn() },
          GRAPH: { getClient: jest.fn() }
        }))

        jest.mock('@defra/wls-queue-defs')

        const { worker } = require('../worker.js')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')
        const { createModels } = require('@defra/wls-database-model')
        const { createQueue } = require('@defra/wls-queue-defs')

        createQueue.mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())

        worker.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())

        require('../file-queue-processor')
        setImmediate(() => {
          expect(worker).toHaveBeenCalled()
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })

  it('has initialisation failure', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('../worker.js')
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-connectors-lib')
        jest.mock('@defra/wls-queue-defs')
        jest.mock('@defra/wls-connectors-lib', () => ({
          AWS: () => ({ S3Client: jest.fn(), GetObjectCommand: jest.fn() }),
          SEQUELIZE: { DataTypes: 'foo', QueryTypes: 'foo' },
          REDIS: { initialiseConnection: jest.fn() },
          GRAPH: { getClient: jest.fn() }
        }))

        const { createModels } = require('@defra/wls-database-model')
        const { worker } = require('../worker.js')
        const { createQueue } = require('@defra/wls-queue-defs')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')

        createQueue.mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())
        worker.mockImplementation(() => Promise.reject(new Error()))

        const processExitSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation(code => {})
        require('../file-queue-processor')
        setImmediate(() => {
          expect(worker).toHaveBeenCalled()
          expect(processExitSpy).toHaveBeenCalledWith(1)
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })
})
