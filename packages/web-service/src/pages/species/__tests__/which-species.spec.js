
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
})
