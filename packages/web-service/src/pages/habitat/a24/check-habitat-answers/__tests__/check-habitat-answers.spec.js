describe('The check habitat answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('check-habitat-answers page', () => {
    it('the check-habitat-answers page forwards onto the tasklist page if no additional setts required', async () => {
      const setTagsMock = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          NOT_STARTED: 'not-started'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress', set: setTagsMock }
            }
          },
          HABITAT: {
            getHabitatsById: () => []
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

    it('the check-habitat-answers page forwards onto dropout active page if no additional setts required and all setts have inactive entrance holes', async () => {
      const setTagsMock = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          NOT_STARTED: 'not-started'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress', set: setTagsMock }
            }
          },
          HABITAT: {
            getHabitatsById: () => [
              {
                numberOfActiveEntrances: 0
              },
              {
                gridReference: 'NY574735',
                startDate: '11-03-2222',
                endDate: '11-30-3001',
                numberOfActiveEntrances: 0
              }
            ]
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
      expect(await completion(request)).toBe('/active-sett-dropout')
    })

    it('if the user clicks "yes" to add a new sett, we should clear the journeyData for the new sett addition', async () => {
      const setData = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          NOT_STARTED: 'not-started'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return { set: jest.fn() }
            }
          },
          HABITAT: {
            getHabitatsById: () => [
              {
                numberOfActiveEntrances: 23
              }
            ]
          }
        })
      }))
      const request = {
        cache: () => {
          return {
            getData: () => ({
              applicationId: '123abc',
              habitatData: {
                name: 'pool party',
                applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f',
                settType: 100000002,
                willReopen: true,
                numberOfEntrances: 54,
                numberOfActiveEntrances: 23,
                active: true,
                gridReference: 'NY574735',
                startDate: '11-03-2222',
                endDate: '11-30-3001',
                methodIds: ['3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24', '290461e0-58ed-ec11-bb3c-000d3a0cee24'],
                speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
                activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24'
              }
            }),
            getPageData: () => ({
              payload: {
                'additional-sett': 'yes'
              }
            }),
            setData: setData
          }
        }
      }
      const { completion } = await import('../check-habitat-answers.js')
      const result = await completion(request)
      expect(result).toBe('/habitat-name')
      expect(setData).toHaveBeenCalledWith({
        applicationId: '123abc'
      })
    })

    it('the check-habitat-answers page forwards onto the habitat-name page if additional setts required', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          IN_PROGRESS: 'in-progress',
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { set: () => jest.fn() }
            }
          },
          HABITAT: {
            getHabitatsById: () => [
              {
                numberOfActiveEntrances: 23
              }
            ]
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
    it('the check-habitat-answers return undefined if the user does not clicked yes or no', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          IN_PROGRESS: 'in-progress',
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { set: () => jest.fn() }
            }
          },
          HABITAT: {
            getHabitatsById: () => [
              {
                numberOfActiveEntrances: 23
              }
            ]
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => ({}),
            getPageData: () => ({
              payload: {
                'additional-sett': 'boom'
              }
            }),
            setData: () => ({})
          }
        }
      }
      const { completion } = await import('../check-habitat-answers.js')
      expect(await completion(request)).toBeUndefined()
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
          methodIds: ['3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24'],
          startDate: '07-25-2023',
          endDate: '07-28-2023',
          willReopen: true
        }
      ])
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          },
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
                DAMAGE_A_SETT: '3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24',
                DESTROY_A_SETT: '290461e0-58ed-ec11-bb3c-000d3a0cee24',
                DISTURB_A_SETT: 'a78bd9ec-58ed-ec11-bb3c-000d3a0cee24',
                OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF: '315af0cf-58ed-ec11-bb3c-000d3a0cee24',
                OBSTRUCT_SETT_WITH_GATES: 'f8a385c9-58ed-ec11-bb3c-000d3a0cee24'
              },
              habitatType: 100000000,
              methodIds: ['3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24'],
              methodTypes: ['3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24'],
              reopen: 'Yes',
              settType: 100000000,
              settTypes: {
                ANNEXE: 100000002,
                MAIN_NO_ALTERNATIVE_SETT: 100000000,
                OUTLIER: 100000003,
                SUBSIDIARY: 100000006
              },
              willReopen: true,
              endDate: '28 July 2023',
              startDate: '25 July 2023'
            }
          ]
      })
    })

    it('getData calls the set() tag function', async () => {
      const mockSet = jest.fn()
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
          methodIds: ['290461e0-58ed-ec11-bb3c-000d3a0cee24'],
          startDate: '07-25-2023',
          endDate: '07-28-2023',
          willReopen: true
        }
      ])
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: mockSet
              }
            }
          },
          HABITAT: {
            getHabitatsById: mockHabitats
          }
        }
      }))
      const { getData } = await import('../check-habitat-answers.js')
      await getData(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'setts', tagState: 'complete-not-confirmed' })
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
          methodIds: ['290461e0-58ed-ec11-bb3c-000d3a0cee24'],
          startDate: '07-25-2023',
          endDate: '07-28-2023',
          willReopen: false
        }
      ])
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          tagStatus: {
            NOT_STARTED: 'not-started'
          },
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          },
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
              DAMAGE_A_SETT: '3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24',
              DESTROY_A_SETT: '290461e0-58ed-ec11-bb3c-000d3a0cee24',
              DISTURB_A_SETT: 'a78bd9ec-58ed-ec11-bb3c-000d3a0cee24',
              OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF: '315af0cf-58ed-ec11-bb3c-000d3a0cee24',
              OBSTRUCT_SETT_WITH_GATES: 'f8a385c9-58ed-ec11-bb3c-000d3a0cee24'
            },
            settTypes: {
              ANNEXE: 100000002,
              MAIN_NO_ALTERNATIVE_SETT: 100000000,
              OUTLIER: 100000003,
              SUBSIDIARY: 100000006
            },
            habitatType: 100000000,
            methodIds: ['290461e0-58ed-ec11-bb3c-000d3a0cee24'],
            methodTypes: ['290461e0-58ed-ec11-bb3c-000d3a0cee24'],
            startDate: '25 July 2023',
            endDate: '28 July 2023',
            willReopen: false,
            reopen: 'No'
          }
        ]
      })
    })

    it('returns the payload from the validator', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        }
      }))
      const payload = { data: 'badgers', 'additional-sett': 'no' }
      const { validator } = await import('../check-habitat-answers.js')
      expect(await validator(payload)).toBeUndefined()
    })

    it('if the user does not input a choice - it raises an error', async () => {
      try {
        jest.doMock('../../../../../services/api-requests.js', () => ({
          tagStatus: {
            NOT_STARTED: 'not-started'
          }
        }))
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
              startDate: '11-03-2222',
              endDate: '11-30-3001',
              methodIds: [100000010, 100000011],
              speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
              activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24'
            }
          })
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          HABITAT: {
            getHabitatsById: () => ['setts']
          }
        }
      }))
      const { checkData } = await import('../check-habitat-answers.js')
      expect(await checkData(request)).toBe(undefined)
    })

    it('checks at least one sett has been sucessfully created, and returns tasklist URL if incorrect', async () => {
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
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          HABITAT: {
            getHabitatsById: () => []
          }
        }
      }))
      const { checkData } = await import('../check-habitat-answers.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })

    it('if one sett had been sucessfully created, it returns undefined', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f'
          })
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          HABITAT: {
            getHabitatsById: () => [
              {
                name: 'pool party',
                applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f',
                settType: 100000002,
                willReopen: true,
                numberOfEntrances: 54,
                numberOfActiveEntrances: 23,
                active: true,
                gridReference: 'NY574735',
                startDate: '11-03-2222',
                endDate: '11-30-3001',
                methodIds: [100000010, 100000011],
                speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85'
              }
            ]
          }
        }
      }))
      const { checkData } = await import('../check-habitat-answers.js')
      expect(await checkData(request)).toBe(undefined)
    })
  })
})
