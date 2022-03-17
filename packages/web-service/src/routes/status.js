export default {
  serviceStatus: {
    method: 'GET',
    path: '/service-status',
    handler: (request, h) => {
      return h.view('service-status.njk')
    },
    config: {
      auth: false
    }
  },
  status: {
    method: 'GET',
    path: '/status',
    handler: () => ({
      alive: true
    }),
    config: {
      auth: false
    }
  }
}
