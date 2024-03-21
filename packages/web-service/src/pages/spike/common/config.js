export const applicantNameConfig = {
  name: 'What is your name?',
  id: 'application-title',
  path: '/spike/title',
  version: '1.0.0',
  journey: {
    next: '/spike/organisation'
  },
  get: async () => console.log('I get the data'),
  save: async () => console.log('I have saved the data')
}

export const applicantOrgNameConfig = {
  name: 'What is the organisation name?',
  id: 'organisation-name',
  path: '/spike/organisation',
  version: '1.0.0',
  journey: {
    back: applicantNameConfig.path,
    next: '/'
  }
}

export const applicantJourney = [
  applicantNameConfig,
  applicantOrgNameConfig
]

// const address = {
//   name: 'What is the address?',
//   path: '/spike/address',
//   version: '1.0.0',
//   api: {
//     baseUrl: '/api/v1' // Base URL for your API routes (optional)
//   }
// }

// ----- Notes

// licence holder
// app.route('/:species', router)

// export const applicantNameConfig = {
//   name: 'What is your name?',
//   id: 'application-title',
//   path: '/spike/title/',
//   version: '1.0.0',
//   // session: {
//   //   key: 'habitat-fella'
//   //   jouenyData.habbita
//   //   journeyData[session.key]
//   // },
//   journey: {
//     // next: organisationName.path
//   },
//   api: {
//     baseUrl: '/api/v1' // Base URL for your API routes (optional)
//   }
// }
