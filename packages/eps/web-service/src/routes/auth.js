const routes = {
  status: {
    method: 'GET',
    path: '/login',
    handler: () => ({
      to: 'do'
    }),
    config: {
      auth: false
    }
  }
}

export default routes
