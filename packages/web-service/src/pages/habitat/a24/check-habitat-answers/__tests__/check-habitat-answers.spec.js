describe('The check habitat answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('check-habitat-answers page', () => {
    it('the check-habitat-answers page forwards onto the tasklist page if no additional setts required', async () => {
      const setTagsMock = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return { get: () => 'inProgress', set: setTagsMock }
            }
          }
        })
      }))
      const request = {
        cache: () => {
          return {
            getData: () => ({ applicationId: '123abc' }),
            getPageData: () => ({
              payload: {
                'additional-sett': 'no'
              }
            }),
            setData: () => ({})
          }
        }
      }
      const { completion } = await import('../check-habitat-answers.js')
      expect(await completion(request)).toBe('/tasklist')
      expect(setTagsMock).toHaveBeenCalledTimes(1)
    })

    it('the check-habitat-answers page forwards onto the habitat-name page if additional setts required', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          inProgress: 'inProgress'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { set: () => true }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => ({}),
            getPageData: () => ({
              payload: {
                'additional-sett': 'yes'
              }
            }),
            setData: () => ({})
          }
        }
      }
      const { completion } = await import('../check-habitat-answers.js')
      expect(await completion(request)).toBe('/habitat-name')
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
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            getHabitatsById: mockHabitats
          }
        }
      }))
      const { getData } = await import('../check-habitat-answers.js')
      expect(await getData(request)).toStrictEqual({
        confirmDelete: '/confirm-delete',
        pageData:
          [
            {
              activityTypes: {
                DAMAGE_A_SETT: 100000012,
                DESTROY_A_SETT: 100000013,
                DISTURB_A_SETT: 100000014,
                OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF: 100000011,
                OBSTRUCT_SETT_WITH_GATES: 100000010
              },
              habitatType: 100000000,
              methodIds: [100000011],
              methodTypes: [100000011],
              reopen: 'Yes',
              settType: 100000000,
              settTypes: {
                ANNEXE: 100000002,
                MAIN_NO_ALTERNATIVE_SETT: 100000000,
                OUTLIER: 100000003,
                SUBSIDIARY: 100000006
              },
              willReopen: true,
              workEnd: '28 July 2023',
              workStart: '25 July 2023'
            }
          ]
      })
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
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            getHabitatsById: mockHabitats
          }
        }
      }))
      const { getData } = await import('../check-habitat-answers.js')
      expect(await getData(request)).toStrictEqual({
        confirmDelete: '/confirm-delete',
        pageData: [
          {
            settType: 100000000,
            activityTypes: {
              DAMAGE_A_SETT: 100000012,
              DESTROY_A_SETT: 100000013,
              DISTURB_A_SETT: 100000014,
              OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF: 100000011,
              OBSTRUCT_SETT_WITH_GATES: 100000010
            },
            settTypes: {
              ANNEXE: 100000002,
              MAIN_NO_ALTERNATIVE_SETT: 100000000,
              OUTLIER: 100000003,
              SUBSIDIARY: 100000006
            },
            habitatType: 100000000,
            methodIds: [100000011],
            methodTypes: [100000011],
            workStart: '25 July 2023',
            workEnd: '28 July 2023',
            willReopen: false,
            reopen: 'No'
          }
        ]
      })
    })

    it('returns the payload from the validator', async () => {
      const payload = { data: 'badgers', 'additional-sett': 'no' }
      const { validator } = await import('../check-habitat-answers.js')
      expect(await validator(payload)).toBeUndefined()
    })

    it('if the user does not input a choice - it raises an error', async () => {
      try {
        const payload = {}
        const { validator } = await import('../check-habitat-answers.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: Option for additional sett has not been chosen')
      }
    })

    it('checks the journeyData object length and returns undefined if correct', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f',
            habitatData: {
              name: 'pool party',
              applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f',
              settType: 100000002,
              willReopen: true,
              numberOfEntrances: 54,
              numberOfActiveEntrances: 23,
              active: true,
              gridReference: 'NY574735',
              workStart: '11-03-2222',
              workEnd: '11-30-3001',
              methodIds: [100000010, 100000011],
              speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
              activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24'
            }
          })
        })
      }
      const { checkData } = await import('../check-habitat-answers.js')
      expect(await checkData(request)).toBe(undefined)
    })

    it('checks the journeyData object length and returns tasklist URL if incorrect', async () => {
      const h = {
        redirect: jest.fn()
      }
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f',
            habitatData: {
              name: 'pool party',
              applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f',
              settType: 100000002,
              willReopen: true,
              numberOfEntrances: 54,
              numberOfActiveEntrances: 23,
              active: true,
              gridReference: 'NY574735',
              workStart: '11-03-2222',
              workEnd: '11-30-3001',
              methodIds: [100000010, 100000011],
              speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85'
            }
          })
        })
      }
      const { checkData } = await import('../check-habitat-answers.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })

    it('should checks the journeyData object length and returns tasklist URL if it is empty', async () => {
      const h = {
        redirect: jest.fn()
      }
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f'
          })
        })
      }
      const { checkData } = await import('../check-habitat-answers.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })

    it('will return applications uri  if the user has not got an application id', async () => {
      const request = {
        cache: () => ({
          getData: () => ({})
        })
      }
      const { checkData } = await import('../check-habitat-answers.js')
      expect(await checkData(request)).toBe('/applications')
    })
  })
})
