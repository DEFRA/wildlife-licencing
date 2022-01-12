import { buildRequestPath, findRequestSequence } from '../../model/model-utils'

// For the test use the example of the multilevel expansion shown here
// https://docs.microsoft.com/en-us/powerapps/developer/data-platform/webapi/retrieve-related-entities-query
// Basically tasks->contact->account->user
// The foo-bar section is added because the nested and listing delimiters differ, ';' and ',' respectively
const result = 'tasks?$select=subject' +
  '&$expand=regardingobjectid_contact_task($select=fullname;' +
  '$expand=parentcustomerid_account($select=name;' +
  '$expand=createdby($select=fullname))),taskfooid($select=bar)'

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
            systemUser: {
              targetEntity: 'systemuser',
              targetFields: {
                fullname: {}
              },
              fk: 'createdby@odata.bind'
            }
          }
        }
      }
    },
    foo: {
      targetEntity: 'foo',
      targetKey: 'fooid',
      targetFields: {
        bar: {}
      },
      fk: 'taskfooid@odata.bind'
    }
  }
}

describe('The model utilities;', () => {
  it('The request path builds correctly from the model', () => {
    expect(buildRequestPath({ tasks })).toBe(result)
  })

  it('The sequence correctly from the model', () => {
    expect(findRequestSequence({ tasks })).toEqual(['systemUser', 'account', 'contact', 'foo', 'tasks'])
  })
})
