describe('The which-species answers page', () => {
  beforeEach(() => jest.resetModules())

  it('getSpeciesData returns the correct data', async () => {
    const { getSpeciesData } = await import('../which-species.js')
    const result = await getSpeciesData()
    expect(result).toEqual({
      speciesSubject: {
        BADGER: '60ce79d8-87fb-ec11-82e5-002248c5c45b'
      }
    })
  })

  it('setSpeciesData calls the filter function and creates the application', async () => {
    const mockSelect = jest.fn(() => ({
      types: ['9d62e5b8-9c77-ec11-8d21-000d3a87431b'],
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18']
    }))
    const mockCreate = jest.fn(() => ({
      id: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
    }))
    const mockSetData = jest.fn()
    const request = {
      payload: { species: '60ce79d8-87fb-ec11-82e5-002248c5c45b' },
      cache: () => ({
        getData: () => ({ preserve: 'this' }),
        setData: mockSetData
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          create: mockCreate
        },
        APPLICATION_TYPES: {
          select: mockSelect
        }
      }
    }))
    const { setSpeciesData } = await import('../which-species.js')
    await setSpeciesData(request)
    expect(mockSelect).toHaveBeenCalledWith({
      activities: ['68855554-59ed-ec11-bb3c-000d3a0cee24'],
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'],
      speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b']
    })
    expect(mockCreate).toHaveBeenCalledWith('9d62e5b8-9c77-ec11-8d21-000d3a87431b', '3db073af-201b-ec11-b6e7-0022481a8f18')
    expect(mockSetData).toHaveBeenCalledWith({ applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10', preserve: 'this' })
  })

  it('setSpeciesData dose nothing if \'other\' is selected', async () => {
    const mockCreate = jest.fn()
    const mockSelect = jest.fn()
    const request = {
      payload: { species: 'other' }
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          create: mockCreate
        },
        APPLICATION_TYPES: {
          select: mockSelect
        }
      }
    }))
    const { setSpeciesData } = await import('../which-species.js')
    await setSpeciesData(request)
    expect(mockSelect).not.toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('speciesCompletion returns the NSIP page if badger is selected', async () => {
    const request = {
      payload: { species: '60ce79d8-87fb-ec11-82e5-002248c5c45b' }
    }
    const { speciesCompletion } = await import('../which-species.js')
    const result = await speciesCompletion(request)
    expect(result).toEqual('/nationally-significant-infrastructure-project')
  })

  it('speciesCompletion returns the other-species page if other is selected', async () => {
    const request = {
      payload: { species: 'other' }
    }
    const { speciesCompletion } = await import('../which-species.js')
    const result = await speciesCompletion(request)
    expect(result).toEqual('/other-species')
  })
})
