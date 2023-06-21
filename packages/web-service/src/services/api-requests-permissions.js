
import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'
import db from 'debug'
const debug = db('web-service:api-requests')

export const PERMISSION = {
  updatePermissionsSection: async (applicationId, payload) => apiRequestsWrapper(
    async () => {
      const permissions = await API.put(`${apiUrls.APPLICATION}/${applicationId}${apiUrls.PERMISSIONS_SECTION}`, payload)
      debug(`Updating permissions details with applicationId ${applicationId}`)
      return permissions
    },
    `Error updating permissions details with applicationId ${applicationId}`,
    500
  ),
  getPermissionDetailsById: async applicationId => apiRequestsWrapper(
    async () => {
      debug(`Getting permission details by applicationId: ${applicationId}`)
      return API.get(`${apiUrls.APPLICATION}/${applicationId}${apiUrls.PERMISSIONS_SECTION}`)
    },
    `Error getting permission details by applicationId: ${applicationId}}`,
    500
  ),
  getPermissions: async applicationId => apiRequestsWrapper(
    async () => {
      debug(`Getting the permissions with applicationId: ${applicationId}`)
      return API.get(`${apiUrls.APPLICATION}/${applicationId}${apiUrls.PERMISSIONS}`)
    },
    `Error finding the permissions with applicationId ${applicationId}`,
    500
  ),
  createPermission: async (applicationId, payload) => apiRequestsWrapper(
    async () => {
      debug(`Create a new permission with applicationId: ${applicationId}`)
      return API.post(`${apiUrls.APPLICATION}/${applicationId}/permission`, payload)
    },
    `Error creating a new permission with applicationId ${applicationId}`,
    500
  ),
  getPermission: async (applicationId, permissionId) => apiRequestsWrapper(
    async () => {
      debug(`Getting the permission with applicationId: ${applicationId}`)
      return API.get(`${apiUrls.APPLICATION}/${applicationId}/permission/${permissionId}`)
    },
    `Error finding the permission with applicationId ${applicationId}`,
    500
  ),
  updatePermission: async (applicationId, permissionId, payload) => apiRequestsWrapper(
    async () => {
      debug(`Update a permission with applicationId: ${applicationId}`)
      return API.put(`${apiUrls.APPLICATION}/${applicationId}/permission/${permissionId}`, payload)
    },
    `Error updating a permission with applicationId ${applicationId}`,
    500
  ),
  removePermission: async (applicationId, permissionId) => apiRequestsWrapper(
    async () => {
      debug(`Delete a permission with applicationId: ${applicationId}`)
      return API.delete(`${apiUrls.APPLICATION}/${applicationId}/permission/${permissionId}`)
    },
    `Error removing a permission with applicationId ${applicationId}`,
    500
  ),
  removePermissionDetails: async applicationId => apiRequestsWrapper(
    async () => {
      debug(`Delete permission details with applicationId: ${applicationId}`)
      return API.delete(`${apiUrls.APPLICATION}/${applicationId}${apiUrls.PERMISSIONS_SECTION}`)
    },
    `Error removing permission details with applicationId ${applicationId}`,
    500
  )
}
