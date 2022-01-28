import filters from '../filters'
import lodash from 'lodash'

describe('.date', () => {
  afterEach(() => jest.resetAllMocks())

  describe('when given a defined value', () => {
    jest.spyOn(lodash, 'isNil')

    const inputValue = '2020-12-30'
    let response

    beforeEach(() => {
      response = filters.date(inputValue)
    })

    it('checks that the value is not null, using lodash', () => {
      expect(lodash.isNil).toHaveBeenCalledWith(inputValue)
    })

    it('returns the value in the default GDS format', () => {
      expect(response).toEqual('30 December 2020')
    })
  })

  describe('when given a nullish input', () => {
    jest.spyOn(lodash, 'isNil')

    const inputValue = null
    let response

    beforeEach(() => {
      response = filters.date(inputValue)
    })

    it('checks that the value is null, using lodash', () => {
      expect(lodash.isNil).toHaveBeenCalledWith(inputValue)
    })

    it('checks that the function returns undefined', () => {
      expect(response).toEqual(undefined)
    })
  })
})
