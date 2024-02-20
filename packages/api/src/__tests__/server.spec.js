import { init, createServer, logResponse, handleErrors } from '../server.js'
import * as winston from 'winston'

describe('The API server', () => {
  it('starts', done => {
    createServer().then(s => {
      init(s).then(() => {
        expect(s.info.port).toEqual(3000)
        s.events.on('stop', () => done())
        s.stop()
      })
    })
  })

  it('handles a request', done => {
    const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
    createServer().then(s => {
      init(s).then(() => {
        s.events.on('stop', () => done())
        s.inject({
          method: 'GET',
          url: `/user/${uuid}`
        })
          .then(r => {
            expect(r).toBe({ id: uuid })
            s.stop()
          })
          .catch(e => {
            console.log(e)
            s.stop()
          })
      })
    })
  })

  it.each([
    ['SIGINT', 130],
    ['SIGTERM', 137]
  ])('shuts down on %s', (signal, code, done) => {
    createServer().then(s => {
      init(s).then(() => {
        s.events.on('stop', () => done())
        const serverStopSpy = jest
          .spyOn(s, 'stop')
          .mockImplementation(jest.fn())
        const processStopSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation(jest.fn())
        process.exit = processStopSpy
        process.emit(signal)
        setImmediate(async () => {
          expect(serverStopSpy).toHaveBeenCalled()
          expect(processStopSpy).toHaveBeenCalledWith(code)
          jest.restoreAllMocks()
          done()
        })
      })
    })
  })
})

jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
    info: jest.fn()
  }),
  format: {
    simple: jest.fn()
  },
  transports: {
    Console: jest.fn()
  }
}))

describe('handleErrors', () => {
  it('should log each error', () => {
    const errors = ['Error 1', 'Error 2']
    handleErrors(errors)
    expect(winston.createLogger().error).toHaveBeenCalledTimes(errors.length)
    errors.forEach((error, index) => {
      expect(winston.createLogger().error).toHaveBeenNthCalledWith(index + 1, error)
    })
  })
})

describe('logResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Clear all mock calls before each test
  })

  it('should log the request details with payload when LOG_PAYLOADS is true', () => {
    process.env.LOG_PAYLOADS = 'true'
    const request = {
      method: 'GET',
      response: {
        statusCode: 200,
        source: {
          errors: ['Error 1', 'Error 2']
        }
      },
      path: '/api/resource',
      raw: { req: { url: '/api/resource' } },
      payload: { key: 'value' }
    }

    logResponse(request)

    expect(winston.createLogger().info).toHaveBeenCalled()
    expect(winston.createLogger().error).toHaveBeenCalledTimes(request.response.source.errors.length)

    const expectedLogString = `${request.method.toUpperCase()} ${request.response.statusCode} ${request.path} --> uri: ${request.raw.req.url} payload: ${JSON.stringify(request.payload)}`
    expect(winston.createLogger().info).toHaveBeenCalledWith(expectedLogString)

    request.response.source.errors.forEach((error, index) => {
      expect(winston.createLogger().error).toHaveBeenNthCalledWith(index + 1, error)
    })
  })

  it('should log the request details without payload when LOG_PAYLOADS is false', () => {
    process.env.LOG_PAYLOADS = 'false'
    const request = {
      method: 'GET',
      response: {
        statusCode: 200,
        source: {
          errors: ['Error 1', 'Error 2']
        }
      },
      path: '/api/resource',
      raw: { req: { url: '/api/resource' } },
      payload: { key: 'value' }
    }

    logResponse(request)

    expect(winston.createLogger().info).toHaveBeenCalled()
    expect(winston.createLogger().error).toHaveBeenCalledTimes(request.response.source.errors.length)

    const expectedLogString = `${request.method.toUpperCase()} ${request.response.statusCode} ${request.path} --> uri: ${request.raw.req.url}`
    expect(winston.createLogger().info).toHaveBeenCalledWith(expectedLogString)

    request.response.source.errors.forEach((error, index) => {
      expect(winston.createLogger().error).toHaveBeenNthCalledWith(index + 1, error)
    })
  })
})
