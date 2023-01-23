import { inDateWindow, validatePageDate, extractDateFromPageDate } from '../date-utils.js'

describe('date-utils', () => {
  beforeEach(() => jest.clearAllMocks())
  describe('test the inDateWindow functions', () => {
    it('where the closed window is over the new year', async () => {
      // November thru April
      const windowStart = { date: 1, month: 11 } // 1st November
      const windowEnd = { date: 30, month: 4 } // 30 April

      // Before new year, inside
      jest.useFakeTimers().setSystemTime(new Date('2022-11-01'))
      expect(inDateWindow(new Date(), windowStart, windowEnd)).toBeTruthy()

      // After new year, inside
      jest.useFakeTimers().setSystemTime(new Date('2023-04-30'))
      expect(inDateWindow(new Date(), windowStart, windowEnd)).toBeTruthy()

      // Before new near, outside
      jest.useFakeTimers().setSystemTime(new Date('2022-10-31'))
      expect(inDateWindow(new Date(), windowStart, windowEnd)).toBeFalsy()

      // After new year, outside
      jest.useFakeTimers().setSystemTime(new Date('2023-05-01'))
      expect(inDateWindow(new Date(), windowStart, windowEnd)).toBeFalsy()
    })

    it('where the closed window is not over the new year', async () => {
      const windowStart = { date: 1, month: 5 } // 1st May
      const windowEnd = { date: 31, month: 10 } // 31st October

      // inside start
      jest.useFakeTimers().setSystemTime(new Date('2022-05-01'))
      expect(inDateWindow(new Date(), windowStart, windowEnd)).toBeTruthy()

      jest.useFakeTimers().setSystemTime(new Date('2022-10-31'))
      expect(inDateWindow(new Date(), windowStart, windowEnd)).toBeTruthy()

      // outside
      jest.useFakeTimers().setSystemTime(new Date('2022-04-30'))
      expect(inDateWindow(new Date(), windowStart, windowEnd)).toBeFalsy()

      // outside
      jest.useFakeTimers().setSystemTime(new Date('2022-11-01'))
      expect(inDateWindow(new Date(), windowStart, windowEnd)).toBeFalsy()
    })
  })

  describe('the validatePageDate function', () => {
    it('throw an error with an empty payload date', async () => {
      expect(() => validatePageDate({ 'x-day': '' }, 'x')).toThrow()
      expect(() => validatePageDate({ 'x-day': '', 'x-month': null, 'x-year': '' }, 'x')).toThrow()
    })
    it('throw an error with an invalid payload date', async () => {
      expect(() => validatePageDate({ 'x-day': '31', 'x-month': '04', 'x-year': '2015' }, 'x')).toThrow()
      expect(() => validatePageDate({ 'x-day': '30', 'x-month': '04', 'x-year': 'x015' }, 'x')).toThrow()
    })
    it('returns a correct UTC date for a valid payload date', async () => {
      const result = validatePageDate({ 'x-day': '30', 'x-month': '04', 'x-year': '2015' }, 'x')
      expect(result.toISOString()).toBe('2015-04-30T00:00:00.000Z')
      const result2 = validatePageDate({ 'x-day': '3', 'x-month': '4', 'x-year': '15' }, 'x')
      expect(result2.toISOString()).toBe('2015-04-03T00:00:00.000Z')
    })
  })

  describe('the extractDateFromPageDate function', () => {
    it('returns a correct UTC date', async () => {
      const result = extractDateFromPageDate({ 'x-day': '30', 'x-month': '04', 'x-year': '2015' }, 'x')
      expect(result.toISOString()).toBe('2015-04-30T00:00:00.000Z')
      const result2 = extractDateFromPageDate({ 'x-day': '3', 'x-month': '4', 'x-year': '15' }, 'x')
      expect(result2.toISOString()).toBe('2015-04-03T00:00:00.000Z')
    })
  })
})
