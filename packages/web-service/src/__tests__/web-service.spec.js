jest.spyOn(console, 'error').mockImplementation(() => null)

describe('The wrapper: web-service', () => {
  it('runs initialisation', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('../server.js')
        jest.mock('../services/virus-scan.js')
        jest.mock('../initialization.js')

        const { REDIS, ADDRESS } = require('@defra/wls-connectors-lib')
        REDIS.initialiseConnection = jest.fn(() => Promise.resolve())
        ADDRESS.initialize = jest.fn(() => Promise.resolve())
        const { initializeScanDir } = require('../initialization.js')
        initializeScanDir.mockImplementation(() => Promise.resolve())
        const { createServer, init } = require('../server.js')
        createServer.mockImplementation(() => Promise.resolve())
        init.mockImplementation(() => Promise.resolve())
        const { initializeClamScan } = require('../services/virus-scan.js')
        initializeClamScan.mockImplementation(() => Promise.resolve())

        require('../web-service')
        setImmediate(() => {
          expect(initializeClamScan).toHaveBeenCalled()
          expect(createServer).toHaveBeenCalled()
          expect(init).toHaveBeenCalled()
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
        jest.mock('../server.js')
        jest.mock('../services/virus-scan.js')
        jest.mock('../initialization.js')
        const { REDIS, ADDRESS } = require('@defra/wls-connectors-lib')
        REDIS.initialiseConnection = jest.fn(() => Promise.resolve())
        ADDRESS.initialize = jest.fn(() => Promise.resolve())
        const { initializeScanDir } = require('../initialization.js')
        initializeScanDir.mockImplementation(() => Promise.resolve())
        const { createServer, init } = require('../server.js')
        createServer.mockImplementation(() => Promise.resolve())
        init.mockImplementation(() => Promise.reject(new Error()))
        const { initializeClamScan } = require('../services/virus-scan.js')
        initializeClamScan.mockImplementation(() => Promise.resolve())

        const processExitSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation(code => {})
        require('../web-service')
        setImmediate(() => {
          expect(init).toHaveBeenCalled()
          expect(createServer).toHaveBeenCalled()
          expect(processExitSpy).toHaveBeenCalledWith(1)
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })
})
