describe('The read-streams provider', () => {
  beforeEach(() => jest.resetModules())

  /** Specifics are covered elsewhere */
  it('calls power-apps read-stream with the correct parameters for the application-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationReadStream } = await import('../read-streams.js')
    applicationReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the sites-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { sitesReadStream } = await import('../read-streams.js')
    sitesReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the application-sites-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationSitesReadStream } = await import('../read-streams.js')
    applicationSitesReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the application-types-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationTypesReadStream } = await import('../read-streams.js')
    applicationTypesReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the application-purposes-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationPurposesReadStream } = await import('../read-streams.js')
    applicationPurposesReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the global option sets', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { globalOptionSetReadStream } = await import('../read-streams.js')
    globalOptionSetReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })
})
