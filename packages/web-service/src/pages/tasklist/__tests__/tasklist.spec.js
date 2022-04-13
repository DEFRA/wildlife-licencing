
describe('The tasklist handler', () => {
  beforeEach(() => jest.resetModules())
  it('the getData works as expected where the eligibility check status is cannot start yet', async () => {
    const decoratedMap = [
      {
        name: 'check-before-you-start',
        tasks: [
          {
            name: 'eligibility-check',
            uri: '/eligibility-check',
            status: 'cannot-start-yet'
          }
        ]
      }]

    jest.doMock('../licence-type-map.js', () => {
      const actual = jest.requireActual('../licence-type-map.js')
      return {
        ...actual,
        getStatus: () => jest.fn(() => 'cannot-start'),
        updateStatusCache: jest.fn(),
        decorateMap: jest.fn(() => decoratedMap)
      }
    })
    const { getData } = await import('../tasklist.js')
    const result = await getData({ })
    expect(result).toEqual({
      licenceType: 'A24 Badger',
      licenceTypeMap: decoratedMap,
      progress: { completed: 0, from: 1 }
    })
  })

  it('the getData works as expected where a task status is set', async () => {
    const decoratedMap = [
      {
        name: 'check-before-you-start',
        tasks: [
          {
            name: 'eligibility-check',
            uri: '/eligibility-check',
            status: 'completed'
          }
        ]
      }]

    jest.doMock('../licence-type-map.js', () => {
      const actual = jest.requireActual('../licence-type-map.js')
      return {
        ...actual,
        getStatus: () => jest.fn(() => 'completed'),
        updateStatusCache: jest.fn(),
        decorateMap: jest.fn(() => decoratedMap)
      }
    })
    const { getData } = await import('../tasklist.js')
    const result = await getData({ })
    expect(result).toEqual({
      licenceType: 'A24 Badger',
      licenceTypeMap: decoratedMap,
      progress: { completed: 1, from: 1 }
    })
  })
})
