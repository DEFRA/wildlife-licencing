import applications from '../app/applications';

export default {
  applications: {
    method: 'GET',
    path: '/applications',
    handler: (request, handler) => applications(request, handler),
    config: {
      auth: false,
    },
  },
};
