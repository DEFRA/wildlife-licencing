import { buildRequestPath } from '../application-extract.js'

// For the test use the example of the multilevel expansion shown here
// https://docs.microsoft.com/en-us/powerapps/developer/data-platform/webapi/retrieve-related-entities-query
// Basically tasks->contact->account->user
const result = 'tasks?$select=subject' +
  '&$expand=regardingobjectid_contact_task($select=fullname;' +
  '$expand=parentcustomerid_account($select=name;' +
  '$expand=createdby($select=fullname)))'

const tasks = {
  targetEntity: 'tasks',
  targetKey: 'tasksid',
  targetFields: {
    subject: {}
  },

  relationships: {
    contact: {
      targetEntity: 'contacts',
      targetKey: 'contactid',
      targetFields: {
        fullname: {}
      },
      fk: 'regardingobjectid_contact_task@odata.bind',
      relationships: {
        account: {
          targetEntity: 'account',
          targetFields: {
            name: {}
          },
          fk: 'parentcustomerid_account@odata.bind',
          relationships: {
            SystemUser: {
              targetEntity: 'systemuser',
              targetFields: {
                fullname: {}
              },
              fk: 'createdby@odata.bind'
            }
          }
        }
      }
    }
  }
}

describe('Build the request path from the model', () => {
  it('Builds correctly', () => {
    expect(buildRequestPath({ tasks })).toBe(result)
  })
})
