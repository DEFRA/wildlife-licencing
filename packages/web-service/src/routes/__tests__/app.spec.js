import routes from '../app';

describe('.app', () => {
  const view = jest.fn();

  beforeEach(() => {
    routes.applications.handler({}, { view });
  });

  it('has a GET method', () => {
    expect(routes.applications.method).toEqual('GET');
  });

  it('has the correct path', () => {
    expect(routes.applications.path).toEqual('/applications');
  });
});
