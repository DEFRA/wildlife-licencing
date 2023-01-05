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

  it('calls power-apps read-stream with the correct parameters for the contacts-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { contactsReadStream } = await import('../read-streams.js')
    contactsReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the accounts-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { accountsReadStream } = await import('../read-streams.js')
    accountsReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the application-contacts-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationContactsReadStream } = await import('../read-streams.js')
    applicationContactsReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the application-accounts-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationAccountsReadStream } = await import('../read-streams.js')
    applicationAccountsReadStream()
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

  it('calls power-apps read-stream with the correct parameters for the licensable actions', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { licensableActionsReadStream } = await import('../read-streams.js')
    licensableActionsReadStream()
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

  it('calls power-apps read-stream with the correct parameters for the activities-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { activitiesReadStream } = await import('../read-streams.js')
    activitiesReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the methods-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { methodsReadStream } = await import('../read-streams.js')
    methodsReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the species-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { speciesReadStream } = await import('../read-streams.js')
    speciesReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the species-subject-read-stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { speciesSubjectReadStream } = await import('../read-streams.js')
    speciesSubjectReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the licensable actions', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { licensableActionsReadStream } = await import('../read-streams.js')
    licensableActionsReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the activity-method read stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { activityMethodsReadStream } = await import('../read-streams.js')
    activityMethodsReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the application-type activities read stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationTypeActivitiesReadStream } = await import('../read-streams.js')
    applicationTypeActivitiesReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the application-type species read stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationTypeSpeciesReadStream } = await import('../read-streams.js')
    applicationTypeSpeciesReadStream()
    expect(mockPowerAppsReadStream).toHaveBeenLastCalledWith(expect.any(String), expect.any(Function))
  })

  it('calls power-apps read-stream with the correct parameters for the application-type purposes read stream', async () => {
    const mockPowerAppsReadStream = jest.fn()
    jest.doMock('../powerapps-read-stream.js', () => ({ powerAppsReadStream: mockPowerAppsReadStream }))
    const { applicationTypeApplicationPurposesReadStream } = await import('../read-streams.js')
    applicationTypeApplicationPurposesReadStream()
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
