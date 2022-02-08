import applications from '../applications';

describe('.applications', () => {
  const view = jest.fn();

  beforeEach(() => {
    applications({}, { view });
  });

  it('has a handler which calls a view', () => {
    expect(view).toHaveBeenCalledWith('app/applications.njk');
  });
});
