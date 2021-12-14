describe('The wrapper: application-queue-processor', () => {
  afterAll(done => {
    jest.clearAllMocks()
    done()
  })

  it('runs initialisation', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('../process.js')
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-connectors-lib')
        jest.mock('@defra/wls-queue-defs')

        const { jobProcess } = require('../process.js')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')
        const { createModels } = require('@defra/wls-database-model')
        const { createQueue } = require('@defra/wls-queue-defs')

        createQueue.mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())
        jobProcess.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())

        require('../application-queue-processor')
        setImmediate(() => {
          expect(jobProcess).toHaveBeenCalled()
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
        jest.mock('../process.js')
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-connectors-lib')
        jest.mock('@defra/wls-queue-defs')

        const { createModels } = require('@defra/wls-database-model')
        const { jobProcess } = require('../process.js')
        const { createQueue } = require('@defra/wls-queue-defs')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')

        createQueue.mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())
        jobProcess.mockImplementation(() => Promise.reject(new Error()))

        const processExitSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation(code => {})
        require('../application-queue-processor')
        setImmediate(() => {
          expect(jobProcess).toHaveBeenCalled()
          expect(processExitSpy).toHaveBeenCalledWith(1)
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })
})
