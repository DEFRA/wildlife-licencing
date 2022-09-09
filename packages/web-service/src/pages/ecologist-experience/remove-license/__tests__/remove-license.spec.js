describe('The remove license page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the license uri if user selects yes', async () => {
      const { completion } = await import('../remove-license.js')
      expect(completion()).toBe('/license')
    })
  })
  describe('get data function', () => {
    it('returns the enter license details uri if user selects yes', async () => {
      const request = {
        query: {
          license: 'AZ1234'
        }
      }
      const { getData } = await import('../remove-license.js')
      expect(await getData(request)).toBe('AZ1234')
    })
    it('returns the enter license details uri if user selects yes', async () => {
      const request = {
        query: {}
      }
      const { getData } = await import('../remove-license.js')
      expect(await getData(request)).toBe('')
    })
  })
  describe('set data function', () => {
    it('does not delete a license if the user selects no', async () => {
      const mockSet = jest.fn()
      const request = {
        query: {
          license: 'AZ1234'
        },
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              licenseDetails: ['AZ1234', 'ZA4321', 'AB2468']
            }
          }),
          getPageData: () => ({
            payload: {
              'remove-license': 'no'
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../remove-license.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledTimes(0)
    })
    it('deletes a license if the user selects yes', async () => {
      const mockSet = jest.fn()
      const request = {
        query: {
          license: 'AZ1234'
        },
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              licenseDetails: ['AZ1234', 'ZA4321', 'AB2468']
            }
          }),
          getPageData: () => ({
            payload: {
              'remove-license': 'yes'
            }
          }),
          setData: mockSet
        })
      }
      const { setData, getData } = await import('../remove-license.js')
      await getData(request)
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        ecologistExperience: {
          licenseDetails: ['ZA4321', 'AB2468']
        }
      })
    })
    it('does not delete a license if the selected license is not in cache', async () => {
      const mockSet = jest.fn()
      const request = {
        query: {
          license: 'AZ0000'
        },
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              licenseDetails: ['AZ1234', 'ZA4321', 'AB2468']
            }
          }),
          getPageData: () => ({
            payload: {
              'remove-license': 'yes'
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../remove-license.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        ecologistExperience: {
          licenseDetails: ['AZ1234', 'ZA4321', 'AB2468']
        }
      })
    })
  })
})
