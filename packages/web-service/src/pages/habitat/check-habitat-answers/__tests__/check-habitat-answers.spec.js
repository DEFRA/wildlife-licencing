
describe('The check habitat answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('check-habitat-answers page', () => {
    it('the check-habitat-answers page forwards onto the tasklist page', async () => {
      const { completion } = await import('../check-habitat-answers.js')
      expect(await completion()).toBe('/tasklist')
    })
    it('forms a date correctly', async () => {
      const dateObj = '03-31-2012'
      const { dateProcessor } = await import('../check-habitat-answers.js')
      expect(dateProcessor(dateObj)).toBe('31 March 2012')
    })
    it('gets data correctly', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            habitatData: {
              applicationId: '079665ab-4547-4506-9915-67f84f87bd6e'
            }
          })
        })
      }
      const mockHabitats = jest.fn(() => [
        {
          settType: 100000000,
          methodIds: [100000011],
          workStart: '07-25-2023',
          workEnd: '07-28-2023',
          willReopen: true
        }
      ])
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            getHabitatsById: mockHabitats
          }
        }
      }))
      const { getData } = await import('../check-habitat-answers.js')
      expect(await getData(request)).toStrictEqual([{
        settType: 100000000,
        habitatType: 'Main',
        methodIds: [100000011],
        methodTypes: ['\nObstructing access to sett entrances by blocking or proofing'],
        workStart: '25 July 2023',
        workEnd: '28 July 2023',
        willReopen: true,
        reopen: 'Yes'
      }])
    })
    it('gets data correctly if willReopen is false', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            habitatData: {
              applicationId: '079665ab-4547-4506-9915-67f84f87bd6e'
            }
          })
        })
      }
      const mockHabitats = jest.fn(() => [
        {
          settType: 100000000,
          methodIds: [100000011],
          workStart: '07-25-2023',
          workEnd: '07-28-2023',
          willReopen: false
        }
      ])
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            getHabitatsById: mockHabitats
          }
        }
      }))
      const { getData } = await import('../check-habitat-answers.js')
      expect(await getData(request)).toStrictEqual([{
        settType: 100000000,
        habitatType: 'Main',
        methodIds: [100000011],
        methodTypes: ['\nObstructing access to sett entrances by blocking or proofing'],
        workStart: '25 July 2023',
        workEnd: '28 July 2023',
        willReopen: false,
        reopen: 'No'
      }])
    })
    it('returns the payload from the validator', async () => {
      const payload = { data: 'badgers' }
      const { validator } = await import('../check-habitat-answers.js')
      expect(await validator(payload)).toStrictEqual({ data: 'badgers' })
    })
  })
})
