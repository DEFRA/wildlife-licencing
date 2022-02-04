export default {
  applications: {
    method: 'GET',
    path: '/applications',
    handler: (request, h) => {
      return h.view('app/applications.njk');
    },
    config: {
      auth: false,
    },
  },
  taskList: {
    method: 'GET',
    path: '/tasklist',
    handler: (request, h) => {
      return h.view('app/tasklist.njk');
    },
    config: {
      auth: false,
    },
  },
};
