export default {
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
