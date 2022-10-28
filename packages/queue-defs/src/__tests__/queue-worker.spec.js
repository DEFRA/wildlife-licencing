
jest.mock('@defra/wls-connectors-lib')

describe('The queue-worker job processor', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('registers a job processor for the queue', async () => {
    const mockProcess = jest.fn()
    jest.doMock('../queue-funcs.js', () => ({
      getQueue: jest.fn(() => ({
        process: mockProcess,
        isPaused: jest.fn(() => false),
        close: jest.fn(),
        resume: jest.fn()
      })),
      queueDefinitions: {
        APPLICATION_QUEUE: {
        }
      }
    }))
    const { queueWorker } = await import('../queue-worker.js')
    await queueWorker('a', () => 'proc1')
    expect(mockProcess).toHaveBeenCalledWith(expect.any(Function))
  })

  it('returns resolve on registration and unpause queue', async () => {
    const mockResume = jest.fn()
    jest.doMock('../queue-funcs.js', () => ({
      getQueue: jest.fn(() => ({
        process: jest.fn(),
        isPaused: jest.fn(() => true),
        pause: jest.fn(),
        close: jest.fn(),
        resume: mockResume
      })),
      queueDefinitions: {
        APPLICATION_QUEUE: {
        }
      }
    }))
    const { queueWorker } = await import('../queue-worker.js')
    await queueWorker('a', () => 'proc1')
    expect(mockResume).toHaveBeenCalled()
  })

  it('closes queue when terminated with SIGINT', async () => {
    const mockClose = jest.fn()
    jest.doMock('../queue-funcs.js', () => ({
      getQueue: jest.fn(() => ({
        process: jest.fn(() => {
          process.emit('SIGINT')
        }),
        isPaused: jest.fn(),
        close: mockClose,
        resume: jest.fn()
      })),
      queueDefinitions: {
        APPLICATION_QUEUE: {}
      }
    }))
    const { queueWorker } = await import('../queue-worker.js')
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(code => {
        console.log(code)
      })

    await queueWorker('a', () => 'proc1')
    expect(processExitSpy).toHaveBeenCalledWith(1)
    expect(mockClose).toHaveBeenCalled()
  })

  it('closes queue when terminated with SIGTERM', async () => {
    const mockClose = jest.fn()
    jest.doMock('../queue-funcs.js', () => ({
      getQueue: jest.fn(() => ({
        process: jest.fn(() => {
          process.emit('SIGTERM')
        }),
        isPaused: jest.fn(),
        close: mockClose,
        resume: jest.fn()
      })),
      queueDefinitions: {
        APPLICATION_QUEUE: {}
      }
    }))
    const { queueWorker } = await import('../queue-worker.js')
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(code => {
        console.log(code)
      })

    await queueWorker('a', () => 'proc1')
    expect(processExitSpy).toHaveBeenCalledWith(1)
    expect(mockClose).toHaveBeenCalled()
  })
})
