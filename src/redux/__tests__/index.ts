import {IReturnType, reduxWrap} from 'src/redux/reduxWrap';

const properInitialState = {
  data: null,
  error: null,
  loading: false,
  ready: false
};

describe('reduxWrap', () => {
  type TestType = IReturnType<any>;

  const config = {
    load: '*',
    loadComplete: '**',
    reset: '***',
    error: '****'
  };
  const reducer = reduxWrap<{}>(config);
  const actionLoad = () => ({type: config.load});
  const actionLoadComplete = (payload: any) => ({type: config.loadComplete, payload});
  const actionReset = () => ({type: config.reset});

  let state: TestType;

  beforeEach(() => {
    state = reducer(undefined, undefined);
  });

  it('should return proper initial state', () => {
    expect(state).toStrictEqual(properInitialState);
  });

  it('should keep correct state after successful load dispatch', () => {
    state = reducer(state, actionLoad()) as TestType;
    expect(state).toStrictEqual({
      data: null,
      error: null,
      loading: true,
      ready: false
    });
  });

  it('should keep correct state after successful loadComplete dispatch', () => {
    const receivedData = 'Pandora';

    state = reducer(state, actionLoadComplete(receivedData)) as TestType;
    expect(state).toStrictEqual({
      data: receivedData,
      error: null,
      loading: false,
      ready: true
    });
  });

  it('should keep correct data after successful reset dispatch', () => {
    const receivedData = 'Pandora';

    state = reducer(state, actionLoadComplete(receivedData)) as IReturnType<any>;
    state = reducer(state, actionReset()) as IReturnType<any>;
    expect(state).toStrictEqual(properInitialState);
  });
});
