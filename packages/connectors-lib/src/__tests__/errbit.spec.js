describe('The errbit connector', () => {
  beforeEach(() => { jest.resetModules() })

  it('is ignored if environment not set', async () => {
    const { ERRBIT } = await import('../errbit.js')
    jest.doMock('../config.js', () => ({
      errbit: {
        host: 'https://errbit-url',
        projectId: '1',
        projectKey: 'project-key'
      }
    }))
    const mockNotify = jest.fn().mockReturnValue(Promise.resolve())
    jest.doMock('@airbrake/node', () => ({
      Notifier: jest.fn().mockImplementation(() => ({
        notify: mockNotify
      }))
    }))
    const mockError = jest.fn().mockImplementation((...args) => null)
    jest.spyOn(console, 'error').mockImplementation(mockError)

    ERRBIT.initialize('service-name')
    console.error('service ERROR', new Error('Error object'))
    expect(mockError).toHaveBeenCalledWith('service ERROR', expect.any(Error))
    expect(mockNotify).not.toHaveBeenCalled()
  })

  it('connects and notifies', async () => {
    jest.doMock('../config.js', () => ({
      errbit: {
        host: 'https://errbit-url',
        projectId: '1',
        projectKey: 'project-key',
        environment: 'local'
      }
    }))
    const mockNotify = jest.fn().mockReturnValue(Promise.resolve())
    jest.doMock('@airbrake/node', () => ({
      Notifier: jest.fn().mockImplementation(() => ({
        notify: mockNotify
      }))
    }))
    const { ERRBIT } = await import('../errbit.js')
    const mockError = jest.fn().mockImplementation((...args) => null)
    jest.spyOn(console, 'error').mockImplementation(mockError)

    ERRBIT.initialize('service-name')
    console.error('service ERROR', new Error('Error object'))
    expect(mockError).toHaveBeenCalledWith('service ERROR', expect.any(Error))

    expect(mockNotify).toHaveBeenCalledWith({
      context: { component: 'service-name' },
      error: expect.any(String)
    })
  })
})
