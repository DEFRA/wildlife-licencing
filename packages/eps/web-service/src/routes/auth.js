export default {
  login: {
    method: 'GET',
    path: '/login',
    handler: (request, h) => {
      return h.view('auth/login.njk')
    },
    config: {
      auth: false
    }
  }
}
