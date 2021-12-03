import filters from '../filters'
import lodash from 'lodash'

jest.spyOn(lodash, 'isNil')

describe('.date', () => {

  afterEach(() => jest.resetAllMocks())

  describe('when given a defined value', () => {

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

    const inputValue = null
    let response

    beforeEach(() => {
      response = filters.date(inputValue)
    })

    it('checks that the value is not null, using lodash', () => {
      expect(lodash.isNil).toHaveBeenCalledWith(inputValue)
    })

    it('returns undefined', () => {
      expect(response).toEqual(undefined)
    })

  })
})
