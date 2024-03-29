import { SddsLicensableActions } from '../sdds-licensable-actions.js'

describe('The SddsLicensableActions table', () => {
  it('src function for start and date returns date only', () => {
    const startDateColumn = SddsLicensableActions.columns.find(c => c.name === 'sdds_proposedstartdate')
    const endDateColumn = SddsLicensableActions.columns.find(c => c.name === 'sdds_proposedenddate')
    expect(startDateColumn.srcFunc('2023-01-24T10:29:57+00:00')).toEqual('2023-01-24')
    expect(endDateColumn.srcFunc('2023-01-24T10:29:57+00:00')).toEqual('2023-01-24')
  })
  it('method target function for start and date returns ISO string', () => {
    const startDateColumn = SddsLicensableActions.columns.find(c => c.name === 'sdds_proposedstartdate')
    const endDateColumn = SddsLicensableActions.columns.find(c => c.name === 'sdds_proposedenddate')
    expect(startDateColumn.tgtFunc('2023-01-24')).toEqual('2023-01-24T00:00:00.000Z')
    expect(endDateColumn.tgtFunc('2023-01-24')).toEqual('2023-01-24T00:00:00.000Z')
  })
})
