const data = {
  habitatSite: {
    name: 'Desctructive',
    startDate: '2022-01-29',
    endDate: '2022-02-03'
  }
}

const keys = [
  {
    apiTable: 'habitatSites',
    apiKey: null,
    apiBasePath: 'habitatSite',
    powerAppsTable: 'sdds_licensableactions',
    contentId: null,
    powerAppsKey: '843a2a44-3180-ec11-8d21-000d3a0ca1c0'
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'habitatSite.sddsApplicationId',
    powerAppsTable: 'sdds_applications',
    contentId: null,
    powerAppsKey: '694b683d-85bc-4685-b1c5-d9a4708fa642'
  },
  {
    apiTable: 'applications',
    apiKey: null,
    apiBasePath: 'habitatSite.sddsApplicationId',
    powerAppsTable: 'sdds_applications',
    contentId: null
  }
]

describe('The application extract processor: write-habitat-site-object', () => {
  beforeEach(() => jest.resetModules())

  it('makes no change if an habitat-site has no sites', async () => {
  })
})
