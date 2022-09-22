describe('The remove licence page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the licence uri if user selects yes', async () => {
      const { completion } = await import('../remove-licence.js')
      expect(completion()).toBe('/licence')
    })
  })
  describe('get data function', () => {
    it('returns the enter licence details uri if user selects yes', async () => {
      const request = {
        query: {
          licence: 'AZ1234'
        }
      }
      const { getData } = await import('../remove-licence.js')
      expect(await getData(request)).toBe('AZ1234')
    })
    it('returns the enter licence details uri if user selects yes', async () => {
      const request = {
        query: {}
      }
      const { getData } = await import('../remove-licence.js')
      expect(await getData(request)).toBe('')
    })
  })
  describe('set data function', () => {
    it('does not delete a licence if the user selects no', async () => {
      const mockSet = jest.fn()
      const request = {
        query: {
          licence: 'AZ1234'
        },
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              licenceDetails: ['AZ1234', 'ZA4321', 'AB2468']
            }
          }),
          getPageData: () => ({
            payload: {
              'remove-licence': 'no'
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../remove-licence.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledTimes(0)
    })
    it('deletes a licence if the user selects yes', async () => {
      const mockSet = jest.fn()
      const request = {
        query: {
          licence: 'AZ1234'
        },
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              licenceDetails: ['AZ1234', 'ZA4321', 'AB2468']
            }
          }),
          getPageData: () => ({
            payload: {
              'remove-licence': 'yes'
            }
          }),
          setData: mockSet
        })
      }
      const { setData, getData } = await import('../remove-licence.js')
      await getData(request)
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        ecologistExperience: {
          licenceDetails: ['ZA4321', 'AB2468']
        }
      })
    })
    it('does not delete a licence if the selected licence is not in cache', async () => {
      const mockSet = jest.fn()
      const request = {
        query: {
          licence: 'AZ0000'
        },
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              licenceDetails: ['AZ1234', 'ZA4321', 'AB2468']
            }
          }),
          getPageData: () => ({
            payload: {
              'remove-licence': 'yes'
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../remove-licence.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        ecologistExperience: {
          licenceDetails: ['AZ1234', 'ZA4321', 'AB2468']
        }
      })
    })
  })
})
